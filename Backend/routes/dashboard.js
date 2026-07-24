/**
 * UPDATED dashboard.js routes
 * Added: /analytics endpoint
 * Replace your existing routes/dashboard.js with this
 */

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getStats, getAnalytics } = require('../controllers/dashboardController');

// Full statistics
router.get('/stats', protect, authorize('admin', 'recruiter'), getStats);

// Recruiter analytics (NEW)
router.get('/analytics', protect, authorize('admin', 'recruiter'), getAnalytics);

module.exports = router;
