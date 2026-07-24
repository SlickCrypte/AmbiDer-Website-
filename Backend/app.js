const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const candidateRoutes = require('./routes/candidates');
const jobRoutes = require('./routes/jobs');
const resumeRoutes = require('./routes/resume');
const applicationRoutes = require('./routes/applications');
const interviewRoutes = require('./routes/interviews');
const notificationRoutes = require('./routes/notifications');
const dashboardRoutes = require('./routes/dashboard');

// NEW ROUTES
const adminRoutes = require('./routes/admin');
const matchingRoutes = require('./routes/matching');
const searchRoutes = require('./routes/search');

const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder
app.use('/uploads', express.static('uploads'));

// ======================
// ROUTES
// ======================

app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// NEW ROUTES
app.use('/api/admin', adminRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/search', searchRoutes);

// Health Check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'ATS Backend Running Successfully 🚀',
  });
});

// Error Handler
app.use(errorHandler);

module.exports = app;