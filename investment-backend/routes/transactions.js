// routes/transactions.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

// @route   GET api/transactions
// @desc    Get user's transactions
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, sortBy = 'createdAt', order = 'desc', startDate, endDate } = req.query;
    const query = { userId: req.user.id };
    
    if (type) query.type = type;
    if (status) query.status = status;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;

    const transactions = await Transaction.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('accountId', 'currency');

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error('Transaction route error:', err);
    res.status(500).send('Server error');
  }
});

// @route   POST api/transactions/deposit
// @desc    Make a deposit
router.post('/deposit', [
  auth,
  check('amount', 'Amount is required and must be positive').isFloat({ min: 0.01 }),
  check('reference', 'Reference is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let account = await Account.findOne({ userId: req.user.id });
    if (!account) {
      return res.status(404).json({ msg: 'Account not found' });
    }

    const { amount, reference, description } = req.body;

    // Create transaction
    const transaction = new Transaction({
      accountId: account._id,
      userId: req.user.id,
      amount,
      type: 'deposit',
      status: 'completed',
      reference,
      description,
      completedAt: new Date()
    });

    await transaction.save();

    // Update account balance
    account.balance += amount;
    account.totalDeposits += amount;
    await account.save();

    res.json({ 
      transaction, 
      balance: account.balance,
      availableBalance: account.balance - account.lockedAmount
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/transactions/withdraw
// @desc    Request a withdrawal
router.post('/withdraw', [
  auth,
  check('amount', 'Amount is required and must be positive').isFloat({ min: 0.01 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let account = await Account.findOne({ userId: req.user.id });
    if (!account) {
      return res.status(404).json({ msg: 'Account not found' });
    }

    const { amount, description } = req.body;

    // Check withdrawal eligibility
    if (amount > account.balance - account.lockedAmount) {
      return res.status(400).json({ msg: 'Insufficient available balance' });
    }

    if (account.balance - amount < account.withdrawalRules.minBalance) {
      return res.status(400).json({ 
        msg: `Withdrawal would go below minimum balance of ${account.withdrawalRules.minBalance}`
      });
    }

    // Check daily withdrawal limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayWithdrawals = await Transaction.aggregate([
      {
        $match: {
          userId: req.user.id,
          type: 'withdrawal',
          status: { $in: ['pending', 'completed'] },
          createdAt: { $gte: today }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const todayTotal = todayWithdrawals[0]?.total || 0;
    if (todayTotal + amount > account.withdrawalRules.dailyLimit) {
      return res.status(400).json({ 
        msg: `Daily withdrawal limit of ${account.withdrawalRules.dailyLimit} exceeded`
      });
    }

    // Create transaction
    const transaction = new Transaction({
      accountId: account._id,
      userId: req.user.id,
      amount,
      type: 'withdrawal',
      status: 'pending',
      description
    });

    await transaction.save();

    // Lock the amount
    account.lockedAmount += amount;
    await account.save();

    res.json({ 
      transaction, 
      balance: account.balance, 
      available: account.balance - account.lockedAmount 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/transactions/:id
// @desc    Get specific transaction
router.get('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('accountId', 'currency');

    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

const auditLog = require('../utils/auditLog'); // hypothetical audit log utility

// Add audit logging middleware for transaction creation and updates
async function logTransaction(action, transaction, userId) {
  try {
    await auditLog.log({
      action,
      transactionId: transaction._id,
      userId,
      amount: transaction.amount,
      type: transaction.type,
      status: transaction.status,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Audit log error:', err);
  }
}

// Wrap transaction creation to add audit logging
router.post('/deposit', [
  auth,
  check('amount', 'Amount is required and must be positive').isFloat({ min: 0.01 }),
  check('reference', 'Reference is required').not().isEmpty(),
  check('method', 'Deposit method is required').not().isEmpty()
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, async (req, res) => {
  try {
    let account = await Account.findOne({ userId: req.user.id });
    if (!account) {
      return res.status(404).json({ msg: 'Account not found' });
    }
    const { amount, reference, description, method } = req.body;
    const transaction = new Transaction({
      accountId: account._id,
      userId: req.user.id,
      amount,
      type: 'deposit',
      status: 'completed',
      reference,
      description,
      method,
      completedAt: new Date()
    });
    await transaction.save();
    account.balance += amount;
    account.totalDeposits += amount;
    await account.save();
    await logTransaction('deposit_created', transaction, req.user.id);
    res.json({ 
      transaction, 
      balance: account.balance,
      availableBalance: account.balance - account.lockedAmount
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Wrap withdrawal creation to add audit logging
router.post('/withdraw', [
  auth,
  check('amount', 'Amount is required and must be positive').isFloat({ min: 0.01 })
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, async (req, res) => {
  try {
    let account = await Account.findOne({ userId: req.user.id });
    if (!account) {
      return res.status(404).json({ msg: 'Account not found' });
    }
    const { amount, description } = req.body;
    if (amount > account.balance - account.lockedAmount) {
      return res.status(400).json({ msg: 'Insufficient available balance' });
    }
    if (account.balance - amount < account.withdrawalRules.minBalance) {
      return res.status(400).json({ 
        msg: `Withdrawal would go below minimum balance of ${account.withdrawalRules.minBalance}`
      });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayWithdrawals = await Transaction.aggregate([
      {
        $match: {
          userId: req.user.id,
          type: 'withdrawal',
          status: { $in: ['pending', 'completed'] },
          createdAt: { $gte: today }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    const todayTotal = todayWithdrawals[0]?.total || 0;
    if (todayTotal + amount > account.withdrawalRules.dailyLimit) {
      return res.status(400).json({ 
        msg: `Daily withdrawal limit of ${account.withdrawalRules.dailyLimit} exceeded`
      });
    }
    const transaction = new Transaction({
      accountId: account._id,
      userId: req.user.id,
      amount,
      type: 'withdrawal',
      status: 'pending',
      description
    });
    await transaction.save();
    account.lockedAmount += amount;
    await account.save();
    await logTransaction('withdrawal_created', transaction, req.user.id);
    res.json({ 
      transaction, 
      balance: account.balance, 
      available: account.balance - account.lockedAmount 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
