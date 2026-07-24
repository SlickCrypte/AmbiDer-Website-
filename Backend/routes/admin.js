const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createRecruiter,
  getAllRecruiters,
  getRecruiter,
  updateRecruiter,
  deleteRecruiter,
  toggleRecruiterStatus,
  resetRecruiterPassword
} = require('../controllers/adminController');

// All routes — Admin only
router.post('/recruiters', protect, authorize('admin'), createRecruiter);
router.get('/recruiters', protect, authorize('admin'), getAllRecruiters);
router.get('/recruiters/:id', protect, authorize('admin'), getRecruiter);
router.put('/recruiters/:id', protect, authorize('admin'), updateRecruiter);
router.delete('/recruiters/:id', protect, authorize('admin'), deleteRecruiter);
router.patch('/recruiters/:id/toggle-status', protect, authorize('admin'), toggleRecruiterStatus);
router.patch('/recruiters/:id/reset-password', protect, authorize('admin'), resetRecruiterPassword);

module.exports = router;
