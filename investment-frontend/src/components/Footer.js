import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.background.paper,
        textAlign: 'center',
        boxShadow: '0 -1px 5px rgba(0,0,0,0.1)',
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {'© '}
        <Link color="inherit" href="https://yourwebsite.com/">
          Investment Tracker
        </Link>{' '}
        {new Date().getFullYear()}
        {'.'}
      </Typography>
    </Box>
  );
};

export default Footer;
