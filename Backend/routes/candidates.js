const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  addCandidate,
  getAllCandidates,
  getCandidate,
  updateCandidate,
  deleteCandidate,
  updateStatus,
  searchCandidates
} = require('../controllers/candidateController');

router.get('/search', protect, searchCandidates);
router.post('/', protect, authorize('admin', 'recruiter'), addCandidate);
router.get('/', protect, authorize('admin', 'recruiter'), getAllCandidates);
router.get('/:id', protect, getCandidate);
router.put('/:id', protect, authorize('admin', 'recruiter'), updateCandidate);
router.delete('/:id', protect, authorize('admin', 'recruiter'), deleteCandidate);
router.put('/:id/status', protect, authorize('admin', 'recruiter'), updateStatus);

module.exports = router;