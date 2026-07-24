const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  scheduledAt: {
    type: Date,
    required: true
  },
  mode: {
    type: String,
    enum: ['Online', 'Offline', 'Phone'],
    default: 'Online'
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  meetingLink: {
    type: String
  },
  location: {
    type: String
  },
  notes: {
    type: String
  },
  feedback: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);