import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, CircularProgress, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
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

const DepositModal = ({ open, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [method, setMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleMethodChange = (event) => {
    setMethod(event.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/transactions/deposit', { 
        amount: parseFloat(amount),
        reference: reference.trim(),
        method
      });
      onSuccess(response.data.transaction, response.data.balance);
    } catch (err) {
      setError(err.response?.data?.msg || 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  const renderMethodPrompt = () => {
    switch (method) {
      case 'mpesa':
        return <Typography variant="body2" sx={{ mt: 2 }}>You selected Mpesa. Please follow the Mpesa payment instructions.</Typography>;
      case 'bank':
        return <Typography variant="body2" sx={{ mt: 2 }}>You selected Bank Transfer. Please use your bank app to transfer funds.</Typography>;
      case 'visa':
        return <Typography variant="body2" sx={{ mt: 2 }}>You selected Visa. You will be prompted to enter your card details.</Typography>;
      case 'bitcoin':
        return <Typography variant="body2" sx={{ mt: 2 }}>You selected Bitcoin. Please send the amount to the provided Bitcoin address.</Typography>;
      default:
        return null;
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2" gutterBottom>
          Deposit Funds
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
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Reference"
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            required
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="deposit-method-label">Deposit Method</InputLabel>
            <Select
              labelId="deposit-method-label"
              value={method}
              label="Deposit Method"
              onChange={handleMethodChange}
            >
              <MenuItem value="mpesa">Mpesa</MenuItem>
              <MenuItem value="bank">Bank Transfer</MenuItem>
              <MenuItem value="visa">Visa</MenuItem>
              <MenuItem value="bitcoin">Bitcoin</MenuItem>
            </Select>
          </FormControl>
          {renderMethodPrompt()}
          {error && (
            <Typography color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={loading || !method}>
              {loading ? <CircularProgress size={24} /> : 'Deposit'}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default DepositModal;
