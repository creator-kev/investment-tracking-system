// routes/admin.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/admin');
const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

// Apply auth and admin middleware to all routes
router.use(auth);
router.use(adminAuth);

// @route   GET api/admin/users
// @desc    Get all users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    let query = {};
    
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/admin/transactions/pending
// @desc    Get pending transactions
router.get('/transactions/pending', async (req, res) => {
  try {
    const transactions = await Transaction.find({ status: 'pending' })
      .populate('userId', 'name email')
      .populate('accountId', 'balance currency')
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/admin/transactions/:id/approve
// @desc    Approve a transaction
router.put('/transactions/:id/approve', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }

    const account = await Account.findById(transaction.accountId);
    if (!account) {
      return res.status(404).json({ msg: 'Account not found' });
    }

    if (transaction.type === 'withdrawal') {
      // Process withdrawal
      account.balance -= transaction.amount;
      account.lockedAmount -= transaction.amount;
      account.totalWithdrawals += transaction.amount;
    }

    transaction.status = 'completed';
    transaction.completedAt = new Date();
    transaction.processedBy = req.user.id;
    transaction.adminNotes = req.body.notes;

    await Promise.all([transaction.save(), account.save()]);

    res.json({ msg: 'Transaction approved successfully', transaction });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/admin/transactions/:id/reject
// @desc    Reject a transaction
router.put('/transactions/:id/reject', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }

    if (transaction.type === 'withdrawal') {
      // Unlock the amount
      const account = await Account.findById(transaction.accountId);
      if (account) {
        account.lockedAmount -= transaction.amount;
        await account.save();
      }
    }

    transaction.status = 'cancelled';
    transaction.processedBy = req.user.id;
    transaction.adminNotes = req.body.notes;

    await transaction.save();

    res.json({ msg: 'Transaction rejected successfully', transaction });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/admin/users/:id/kyc
// @desc    Update KYC status
router.put('/users/:id/kyc', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.kycStatus = status;
    await user.save();

    res.json({ msg: 'KYC status updated successfully', user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/admin/stats
// @desc    Get platform statistics
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAccounts = await Account.countDocuments();
    const totalBalance = await Account.aggregate([
      { $group: { _id: null, total: { $sum: '$balance' } } }
    ]);
    
    const totalTransactions = await Transaction.countDocuments();
    const pendingTransactions = await Transaction.countDocuments({ status: 'pending' });
    
    const monthlyDeposits = await Transaction.aggregate([
      {
        $match: {
          type: 'deposit',
          status: 'completed',
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      totalUsers,
      totalAccounts,
      totalBalance: totalBalance[0]?.total || 0,
      totalTransactions,
      pendingTransactions,
      monthlyDeposits: monthlyDeposits[0]?.total || 0
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;