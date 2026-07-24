const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['application', 'status_change', 'new_candidate', 'general'],
    default: 'general'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  relatedCandidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate'
  },
  relatedJob: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);