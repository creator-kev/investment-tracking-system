// models/Account.js
const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  lockedAmount: {
    type: Number,
    default: 0
  },
  totalDeposits: {
    type: Number,
    default: 0
  },
  totalWithdrawals: {
    type: Number,
    default: 0
  },
  totalInterest: {
    type: Number,
    default: 0
  },
  interestRate: {
    type: Number,
    default: 0.05 // 5% annual interest
  },
  lastInterestCalculation: {
    type: Date,
    default: Date.now
  },
  withdrawalRules: {
    minBalance: {
      type: Number,
      default: 0
    },
    lockPeriod: {
      type: Number, // in days
      default: 7
    },
    dailyLimit: {
      type: Number,
      default: 10000
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Account', AccountSchema);