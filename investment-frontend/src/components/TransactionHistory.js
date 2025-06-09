import React from 'react';
import { List, ListItem, ListItemText, Typography } from '@mui/material';

const TransactionHistory = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return <Typography>No transactions found.</Typography>;
  }

  return (
    <List>
      {transactions.map((transaction) => (
        <ListItem key={transaction._id || transaction.id} divider>
          <ListItemText
            primary={transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
            secondary={
              <>
                <Typography component="span" variant="body2" color="text.primary">
                  Amount: ${transaction.amount.toFixed(2)}
                </Typography>
                {' — '}
                <Typography component="span" variant="body2" color="text.secondary">
                  Date: {new Date(transaction.createdAt).toLocaleString()}
                </Typography>
              </>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

export default TransactionHistory;
