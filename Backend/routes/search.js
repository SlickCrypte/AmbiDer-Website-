const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { searchCandidates } = require('../controllers/searchController');

// Advanced candidate search
router.get('/candidates', protect, authorize('admin', 'recruiter'), searchCandidates);

module.exports = router;
