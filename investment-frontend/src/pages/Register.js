// src/pages/Register.js
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box, Alert } from '@mui/material';
import AuthContext from '../context/authContext';
import api from '../api';

const Register = () => {
  const { setAuthToken } = useContext(AuthContext);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/auth/register', formData);
      setAuthToken(res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        mt: 8,
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        borderRadius: 2,
        boxShadow: 3,
        p: 4,
      }}
    >
      <Box
        component="form"
        onSubmit={handleRegister}
        sx={{
          width: '100%',
          backgroundColor: 'background.paper',
          p: 4,
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography variant="h4" gutterBottom align="center">
          Register
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          label="Name"
          name="name"
          fullWidth
          margin="normal"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <TextField
          label="Email"
          name="email"
          fullWidth
          margin="normal"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <TextField
          label="Phone Number"
          name="phone"
          fullWidth
          margin="normal"
          value={formData.phone}
          onChange={handleChange}
          required
          placeholder="+1 555 555 5555"
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          fullWidth
          margin="normal"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>
          Register
        </Button>
      </Box>
    </Container>
  );
};

export default Register;
