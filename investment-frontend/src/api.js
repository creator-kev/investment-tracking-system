import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // Adjust the baseURL as needed for your backend server
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token in the 'x-auth-token' header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const updateProfile = (profileData) => {
  return api.put('/api/auth/profile', profileData);
};

export default api;
