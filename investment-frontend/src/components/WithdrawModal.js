import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, CircularProgress, Alert } from '@mui/material';
import api from '../api';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2
};

const WithdrawModal = ({ open, onClose, onSuccess, available, minBalance, onError }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/transactions/withdraw', { amount: parseFloat(amount) });
      onSuccess(
        response.data.transaction, 
        response.data.balance, 
        response.data.lockedAmount
      );
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Withdrawal failed';
      setError(errorMsg);
      if (typeof onError === 'function') {
        onError();
      }
    } finally {
      setLoading(false);
    }
  };

  const validateAmount = (value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'Must be a number';
    if (numValue <= 0) return 'Amount must be positive';
    if (numValue > available) return 'Exceeds available balance';
    if (available - numValue < minBalance) return `Would go below minimum balance of ${minBalance}`;
    return '';
  };

  const amountError = amount ? validateAmount(amount) : '';

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2" gutterBottom>
          Withdraw Funds
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Available: ${available.toFixed(2)}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputProps={{ step: "0.01", min: "0.01" }}
            error={!!amountError}
            helperText={amountError}
            required
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading || !!amountError}
            >
              {loading ? <CircularProgress size={24} /> : 'Withdraw'}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default WithdrawModal;