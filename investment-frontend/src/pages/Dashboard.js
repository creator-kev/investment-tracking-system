import React, { useContext, useEffect, useState } from 'react';
import { Container, Typography, Box, Grid, Button, Card, CardContent } from '@mui/material';
import AuthContext from '../context/authContext';
import api from '../api';
import DepositModal from '../components/DepositModal';
import WithdrawModal from '../components/WithdrawModal';
import TransactionHistory from '../components/TransactionHistory';
import PortfolioChart from '../components/PortfolioChart';
import { useTheme } from '@mui/material/styles';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const [account, setAccount] = useState(null);
  const [openDeposit, setOpenDeposit] = useState(false);
  const [openWithdraw, setOpenWithdraw] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const response = await api.get('/api/accounts/me');
        setAccount(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchTransactions = async () => {
      try {
        const response = await api.get('/api/transactions');
        setTransactions(response.data.transactions);

        // Prepare chart data from transactions (example: sum by date)
        const dataMap = {};
        response.data.transactions.forEach(tx => {
          const date = new Date(tx.createdAt).toLocaleDateString();
          if (!dataMap[date]) dataMap[date] = 0;
          if (tx.type === 'deposit') {
            dataMap[date] += tx.amount;
          } else if (tx.type === 'withdraw') {
            dataMap[date] -= tx.amount;
          }
        });
        const chartArray = Object.entries(dataMap).map(([date, value]) => ({ date, value }));
        setChartData(chartArray);
      } catch (err) {
        console.error(err);
      }
    };

    if (user) {
      fetchAccount();
      fetchTransactions();
    }
  }, [user]);

  const handleDepositSuccess = (newTransaction, newBalance) => {
    setAccount({ ...account, balance: newBalance });
    setTransactions([newTransaction, ...transactions]);
    setOpenDeposit(false);
  };

  const handleWithdrawSuccess = (newTransaction, newBalance, newLockedAmount) => {
    setAccount({ ...account, balance: newBalance, lockedAmount: newLockedAmount });
    setTransactions([newTransaction, ...transactions]);
    setOpenWithdraw(false);
  };

  if (!account) return <div>Loading...</div>;

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Investment Dashboard
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Portfolio Value
                </Typography>
                <Typography variant="h3" component="div" sx={{ color: theme.palette.primary.main }}>
                  ${account.balance.toFixed(2)}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  Available: ${(account.balance - account.lockedAmount).toFixed(2)}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => setOpenDeposit(true)}
                  >
                    Deposit
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setOpenWithdraw(true)}
                    disabled={account.balance <= 0}
                  >
                    Withdraw
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Account Details
                </Typography>
                <Typography variant="body1">
                  Currency: {account.currency}
                </Typography>
                <Typography variant="body1">
                  Minimum Balance: ${account.withdrawalRules.minBalance.toFixed(2)}
                </Typography>
                <Typography variant="body1">
                  Lock Period: {account.withdrawalRules.lockPeriod} days
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h5" sx={{ mb: 2 }}>
          Portfolio Chart
        </Typography>
        <PortfolioChart data={chartData} />

        <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
          Recent Transactions
        </Typography>
        <TransactionHistory transactions={transactions} />
      </Box>

      <DepositModal
        open={openDeposit}
        onClose={() => setOpenDeposit(false)}
        onSuccess={handleDepositSuccess}
      />
      <WithdrawModal
        open={openWithdraw}
        onClose={() => setOpenWithdraw(false)}
        onSuccess={handleWithdrawSuccess}
        available={account.balance - account.lockedAmount}
        minBalance={account.withdrawalRules.minBalance}
        onError={() => {
          // Refresh account data on withdrawal error to sync balances
          api.get('/api/accounts/me')
            .then(response => setAccount(response.data))
            .catch(err => console.error('Failed to refresh account data:', err));
        }}
      />
    </Container>
  );
};

export default Dashboard;
