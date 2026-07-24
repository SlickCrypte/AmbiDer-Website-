const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  scheduleInterview,
  getAllInterviews,
  getInterview,
  updateInterview,
  cancelInterview,
  deleteInterview
} = require('../controllers/interviewController');

router.post('/', protect, authorize('admin', 'recruiter'), scheduleInterview);
router.get('/', protect, authorize('admin', 'recruiter'), getAllInterviews);
router.get('/:id', protect, getInterview);
router.put('/:id', protect, authorize('admin', 'recruiter'), updateInterview);
router.put('/:id/cancel', protect, authorize('admin', 'recruiter'), cancelInterview);
router.delete('/:id', protect, authorize('admin', 'recruiter'), deleteInterview);

module.exports = router;