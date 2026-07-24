const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
} = require('../controllers/notificationController');

router.post('/', protect, createNotification);
router.get('/', protect, getNotifications);
router.get('/unread', protect, getUnreadCount);
router.put('/:id/read', protect, markAsRead);
router.put('/read/all', protect, markAllAsRead);
router.delete('/:id', protect, deleteNotification);
router.delete('/delete/all', protect, deleteAllNotifications);

module.exports = router;