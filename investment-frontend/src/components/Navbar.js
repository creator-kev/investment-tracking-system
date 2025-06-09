import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import AuthContext from '../context/authContext';

const Navbar = () => {
  const { authToken, logout } = useContext(AuthContext);

  return (
    <AppBar position="static" color="primary" sx={{ mb: 4 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Investment Tracker
        </Typography>
        {authToken ? (
          <>
            <Button color="inherit" component={Link} to="/" sx={{ mx: 1 }}>
              Dashboard
            </Button>
            <Button color="inherit" component={Link} to="/transactions" sx={{ mx: 1 }}>
              Transactions
            </Button>
            <IconButton
              color="inherit"
              component={Link}
              to="/profile"
              sx={{ mx: 1 }}
              aria-label="settings"
            >
              <SettingsIcon />
            </IconButton>
            <Button color="inherit" onClick={logout} sx={{ mx: 1 }}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button color="inherit" component={Link} to="/login" sx={{ mx: 1 }}>
              Login
            </Button>
            <Button color="inherit" component={Link} to="/register" sx={{ mx: 1 }}>
              Register
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
