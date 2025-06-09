const Account = require('../models/Account');

async function calculateAndApplyInterest() {
  try {
    const accounts = await Account.find({ isActive: true });

    const now = new Date();

    for (const account of accounts) {
      const lastCalc = account.lastInterestCalculation || account.createdAt || now;
      const daysElapsed = Math.floor((now - lastCalc) / (1000 * 60 * 60 * 24));

      if (daysElapsed <= 0) continue;

      // Calculate daily interest rate from annual rate
      const dailyInterestRate = account.interestRate / 365;

      // Calculate interest for the elapsed days on the current balance
      const interest = account.balance * dailyInterestRate * daysElapsed;

      if (interest > 0) {
        account.balance += interest;
        account.totalInterest += interest;
        account.lastInterestCalculation = now;
        await account.save();
      }
    }

    console.log('Interest calculation completed for all accounts.');
  } catch (err) {
    console.error('Error calculating interest:', err);
  }
}

module.exports = {
  calculateAndApplyInterest
};
