const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

const {
  createJob,
  getAllJobs,
  getJob,
  updateJob,
  deleteJob
} = require('../controllers/jobController');

// Recruiter/Admin only
router.post('/', protect, authorize('admin', 'recruiter'), createJob);

// Public routes
router.get('/', getAllJobs);
router.get('/:id', getJob);

// Recruiter/Admin only
router.put('/:id', protect, authorize('admin', 'recruiter'), updateJob);
router.delete('/:id', protect, authorize('admin', 'recruiter'), deleteJob);

module.exports = router;