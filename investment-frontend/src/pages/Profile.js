import React, { useState, useEffect, useContext } from 'react';
import { Container, Typography, TextField, Button, Box, Alert, Divider } from '@mui/material';
import AuthContext from '../context/authContext';
import api from '../api';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handlePhoneChange = (value) => {
    setFormData({...formData, phone: value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await api.put('/api/auth/profile', formData);
      setUser(res.data);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update profile');
    }
  };

  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        User Profile
      </Typography>
      <Button variant="outlined" onClick={toggleSettings} sx={{ mb: 3 }}>
        {settingsOpen ? 'Close Settings' : 'Open Settings'}
      </Button>
      {settingsOpen && (
        <Box sx={{ mb: 4, p: 2, border: '1px solid #00ff88', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Settings
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Manage your project settings below.
          </Typography>

          {/* Notification Preferences */}
          <Box sx={{ mb: 2 }}>
            <label>
              <input
                type="checkbox"
                checked={formData.emailNotifications || false}
                onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
              />
              {' '}Enable Email Notifications
            </label>
          </Box>

          {/* Security Settings */}
          <Box sx={{ mb: 2 }}>
            <label>
              <input
                type="checkbox"
                checked={formData.twoFactorAuth || false}
                onChange={(e) => setFormData({ ...formData, twoFactorAuth: e.target.checked })}
              />
              {' '}Enable Two-Factor Authentication (2FA)
            </label>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom>
            Change Password
          </Typography>
          <Box component="form" onSubmit={(e) => e.preventDefault()}>
            <TextField
              label="Current Password"
              type="password"
              fullWidth
              margin="normal"
              name="currentPassword"
              value={formData.currentPassword || ''}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
            />
            <TextField
              label="New Password"
              type="password"
              fullWidth
              margin="normal"
              name="newPassword"
              value={formData.newPassword || ''}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            />
            <TextField
              label="Confirm New Password"
              type="password"
              fullWidth
              margin="normal"
              name="confirmNewPassword"
              value={formData.confirmNewPassword || ''}
              onChange={(e) => setFormData({ ...formData, confirmNewPassword: e.target.value })}
            />
            <Button variant="contained" sx={{ mt: 1 }}>
              Update Password
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Privacy Settings */}
          <Box sx={{ mb: 2 }}>
            <label>
              <input
                type="checkbox"
                checked={formData.profileVisibility || false}
                onChange={(e) => setFormData({ ...formData, profileVisibility: e.target.checked })}
              />
              {' '}Make Profile Public
            </label>
          </Box>

          {/* Account Settings */}
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Default Currency"
              fullWidth
              margin="normal"
              value={formData.defaultCurrency || ''}
              onChange={(e) => setFormData({ ...formData, defaultCurrency: e.target.value })}
              placeholder="e.g. USD, EUR"
            />
          </Box>

          {/* Display Preferences */}
          <Box sx={{ mb: 2 }}>
            <label>
              <input
                type="checkbox"
                checked={formData.darkMode || false}
                onChange={(e) => setFormData({ ...formData, darkMode: e.target.checked })}
              />
              {' '}Enable Dark Mode
            </label>
          </Box>

          {/* Payment and Billing */}
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Payment Method"
              fullWidth
              margin="normal"
              value={formData.paymentMethod || ''}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              placeholder="e.g. Credit Card, PayPal"
            />
          </Box>

          {/* Project-Specific Settings */}
          <Box sx={{ mb: 2 }}>
            <label>
              <input
                type="checkbox"
                checked={formData.investmentAlerts || false}
                onChange={(e) => setFormData({ ...formData, investmentAlerts: e.target.checked })}
              />
              {' '}Enable Investment Alerts
            </label>
          </Box>
        </Box>
      )}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Box component="form" onSubmit={handleSubmit} noValidate>
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
          disabled
        />
        <PhoneInput
          international
          defaultCountry="US"
          value={formData.phone}
          onChange={handlePhoneChange}
          placeholder="Enter phone number"
          style={{ width: '100%', marginTop: 16, marginBottom: 8 }}
          required
        />
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>
          Update Profile
        </Button>
      </Box>
    </Container>
  );
};

export default Profile;
