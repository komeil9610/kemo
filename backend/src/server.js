require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const operationsRoutes = require('./routes/operations');

// Initialize Express App
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Database Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB_NAME,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log('✅ MongoDB Connected Successfully');
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: '🟢 Server is running', timestamp: new Date() });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/operations', operationsRoutes);
app.use('/api', operationsRoutes);
app.use('/api/notifications', require('./routes/notifications'));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: '🔴 Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
