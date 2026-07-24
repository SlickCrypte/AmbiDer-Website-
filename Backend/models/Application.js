/**
 * UPDATED Application.js model
 * Added: matchingPercentage, matchedSkills, missingSkills
 * Replace your existing models/Application.js with this file
 * All existing fields preserved — only new fields added
 */

const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: [true, 'Candidate is required']
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job is required']
  },
  status: {
    type: String,
    enum: ['Applied', 'Screened', 'Interview', 'Hired', 'Rejected'],
    default: 'Applied'
  },
  coverLetter: {
    type: String
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },

  // --- NEW FIELDS (Resume Matching Engine) ---
  matchingPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  matchedSkills: {
    type: [String],
    default: []
  },
  missingSkills: {
    type: [String],
    default: []
  }
  // --- END NEW FIELDS ---

}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
