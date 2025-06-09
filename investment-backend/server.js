require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://gachokakevin8:kevingac@cluster0.huu6toe.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB successfully');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
app.use(express.json());
app.use(cors());

// Routes
app.get('/', (req, res) => {
  res.send('Investment Backend API');
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/accounts', require('./routes/accounts'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/admin', require('./routes/admin'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
