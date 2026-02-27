require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const app = express();

/* ========================
   CORS CONFIGURATION
======================== */

const corsOptions = {
  origin: 'https://finzee-gamma.vercel.app', // React frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

/* ========================
   MIDDLEWARE
======================== */

app.use(express.json());

/* ========================
   ROUTES
======================== */

app.use('/api/auth', require('./routes/auth'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/budget', require('./routes/budget'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/insights', require('./routes/insights'));
app.use('/api/health-score', require('./routes/healthScore'));

/* ========================
   ERROR HANDLER
======================== */

app.use(errorHandler);

/* ========================
   MONGODB CONNECTION
======================== */

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

/* ========================
   SERVER START
======================== */

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
