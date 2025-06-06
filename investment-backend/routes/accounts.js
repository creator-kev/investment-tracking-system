// routes/accounts.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

// @route   GET api/accounts/me
// @desc    Get current user's account
router.get('/me', auth, async (req, res) => {
  try {
    const account = await Account.findOne({ userId: req.user.id });
    if (!account) {
      return res.status(404).json({ msg: 'Account not found' });
    }
    res.json(account);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/accounts/balance
// @desc    Get account balance
router.get('/balance', auth, async (req, res) => {
  try {
    const account = await Account.findOne({ userId: req.user.id });
    if (!account) {
      return res.status(404).json({ msg: 'Account not found' });
    }
    
    res.json({
      balance: account.balance,
      lockedAmount: account.lockedAmount,
      availableBalance: account.balance - account.lockedAmount,
      currency: account.currency
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/accounts/settings
// @desc    Update account settings
router.put('/settings', auth, async (req, res) => {
  try {
    const account = await Account.findOne({ userId: req.user.id });
    if (!account) {
      return res.status(404).json({ msg: 'Account not found' });
    }

    const { withdrawalRules } = req.body;
    if (withdrawalRules) {
      account.withdrawalRules = { ...account.withdrawalRules, ...withdrawalRules };
    }

    await account.save();
    res.json(account);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;