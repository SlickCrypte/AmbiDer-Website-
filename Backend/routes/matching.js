const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  matchCandidateToJob,
  matchAllCandidatesForJob,
  getRankedCandidates
} = require('../controllers/matchingController');

// Match single candidate to job
router.post('/match', protect, authorize('admin', 'recruiter'), matchCandidateToJob);

// Run matching for all applicants of a job
router.post('/job/:jobId/match-all', protect, authorize('admin', 'recruiter'), matchAllCandidatesForJob);

// Get ranked candidates for a job (also registered in applications routes)
router.get('/job/:jobId/ranking', protect, authorize('admin', 'recruiter'), getRankedCandidates);

module.exports = router;
