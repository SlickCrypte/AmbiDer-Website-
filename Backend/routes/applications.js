const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createApplication,
  getAllApplications,
  getApplication,
  getApplicationsByJob,
  getApplicationsByCandidate,
  updateApplicationStatus,
  deleteApplication
} = require('../controllers/applicationController');

router.post('/', protect, authorize('candidate'), createApplication);
router.get('/', protect, authorize('admin', 'recruiter'), getAllApplications);
router.get('/:id', protect, getApplication);
router.get('/job/:jobId', protect, authorize('admin', 'recruiter'), getApplicationsByJob);
router.get('/candidate/:candidateId', protect, getApplicationsByCandidate);
router.put('/:id/status', protect, authorize('admin', 'recruiter'), updateApplicationStatus);
router.delete('/:id', protect, deleteApplication);

module.exports = router;