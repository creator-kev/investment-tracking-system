import React from 'react';
import { Container, Typography } from '@mui/material';

const Transactions = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Transactions Page
      </Typography>
      <Typography>
        This is a placeholder for the Transactions page. You can implement transaction listing and management here.
      </Typography>
    </Container>
  );
};

export default Transactions;
