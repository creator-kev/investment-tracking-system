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
    const { page = 1, limit = 10, type, status } = req.query;
    const query = { userId: req.user.id };
    
    if (type) query.type = type;
    if (status) query.status = status;

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
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
    console.error(err.message);
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

module.exports = router;