const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const candidateRoutes = require('./routes/candidates');
const resumeRoutes = require('./routes/resume');
const dashboardRoutes = require('./routes/dashboard');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const notificationRoutes = require('./routes/notifications');
const interviewRoutes = require('./routes/interviews');

// NEW
const adminRoutes = require('./routes/admin');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

app.use('/uploads', express.static('uploads'));


// =========================
// API Routes
// =========================

app.use('/api/auth', authRoutes);

app.use('/api/candidates', candidateRoutes);

app.use('/api/resume', resumeRoutes);

app.use('/api/dashboard', dashboardRoutes);

app.use('/api/jobs', jobRoutes);

app.use('/api/applications', applicationRoutes);

app.use('/api/notifications', notificationRoutes);

app.use('/api/interviews', interviewRoutes);

// NEW ADMIN ROUTES
app.use('/api/admin', adminRoutes);

// =========================
// Global Error Handler
// =========================

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    message: err.message || 'Something went wrong'
  });
});

// =========================
// Database Connection
// =========================

mongoose.connect(process.env.MONGO_URI)
.then(() => {

  console.log('MongoDB Connected ✅');

  app.listen(process.env.PORT, () => {

    console.log(`Server running on port ${process.env.PORT}`);

  });

})
.catch((err) => {

  console.log('DB Connection Failed ❌');

  console.log(err);

});