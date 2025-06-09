const axios = require('axios');

const apiBase = 'http://localhost:5000/api';

async function testRegister() {
  try {
    const res = await axios.post(apiBase + '/auth/register', {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
      phone: '1234567890'
    });
    console.log('Register:', res.data);
    return res.data.token;
  } catch (err) {
    console.error('Register error:', err.response ? err.response.data : err.message);
  }
}

async function testLogin() {
  try {
    const res = await axios.post(apiBase + '/auth/login', {
      email: 'testuser@example.com',
      password: 'password123'
    });
    console.log('Login:', res.data);
    return res.data.token;
  } catch (err) {
    console.error('Login error:', err.response ? err.response.data : err.message);
  }
}

async function testGetMe(token) {
  try {
    const res = await axios.get(apiBase + '/auth/me', {
      headers: { Authorization: 'Bearer ' + token }
    });
    console.log('Get Me:', res.data);
  } catch (err) {
    console.error('Get Me error:', err.response ? err.response.data : err.message);
  }
}

async function testUpdateProfile(token) {
  try {
    const res = await axios.put(apiBase + '/auth/profile', {
      name: 'Updated User',
      phone: '0987654321'
    }, {
      headers: { Authorization: 'Bearer ' + token }
    });
    console.log('Update Profile:', res.data);
  } catch (err) {
    console.error('Update Profile error:', err.response ? err.response.data : err.message);
  }
}

async function testVerifyEmail(token) {
  try {
    // This test assumes you have a valid token from registration
    const res = await axios.post(apiBase + '/auth/verify-email', {
      token: token
    });
    console.log('Verify Email:', res.data);
  } catch (err) {
    console.error('Verify Email error:', err.response ? err.response.data : err.message);
  }
}

async function runTests() {
  const registerToken = await testRegister();
  const loginToken = await testLogin();
  if (loginToken) {
    await testGetMe(loginToken);
    await testUpdateProfile(loginToken);
    if (registerToken) {
      await testVerifyEmail(registerToken);
    }
  }
}

runTests();
