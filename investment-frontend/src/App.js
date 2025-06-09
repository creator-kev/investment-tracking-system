import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AuthContext from './context/authContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Transactions from './pages/Transactions';
import Navbar from './components/Navbar';
import api from './api';
import Footer from './components/Footer';
import Profile from './pages/Profile';


const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00ff88',
      contrastText: '#000000',
    },
    secondary: {
      main: '#03dac6',
      contrastText: '#000000',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#a0a0a0',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '0.02em',
    },
    h5: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '10px 20px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#272727',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        },
      },
    },
  },
});

function App() {
  const [authToken, setAuthToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  const setToken = (token) => {
    localStorage.setItem('token', token);
    setAuthToken(token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setUser(null);
  };

  useEffect(() => {
    if (authToken) {
      const fetchUser = async () => {
        try {
          const response = await api.get('/api/auth/me');
          setUser(response.data);
        } catch (err) {
          console.error(err);
          logout();
        }
      };
      fetchUser();
    }
  }, [authToken]);

  // PrivateRoute component to protect routes
  const PrivateRoute = ({ children }) => {
    return authToken ? children : <Navigate to="/login" replace />;
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AuthContext.Provider value={{ authToken, setAuthToken: setToken, user, logout }}>
        <Router>
          <Navbar />
          <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route path="/login" element={authToken ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/register" element={authToken ? <Navigate to="/" replace /> : <Register />} />
          <Route
            path="/transactions"
            element={
              <PrivateRoute>
                <Transactions />
              </PrivateRoute>
            }
          />
          </Routes>
          <Footer />
        </Router>
      </AuthContext.Provider>
    </ThemeProvider>
  );
}

export default App;
