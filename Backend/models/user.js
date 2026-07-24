/**
 * UPDATED User.js model
 * Added: isActive field for recruiter activation/deactivation
 * Replace your existing models/User.js with this file
 * All existing fields preserved — only new fields added
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'recruiter', 'candidate'],
    default: 'candidate'
  },
  phone: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String
  },
  candidateProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    default: null
  },

  // --- NEW FIELD ---
  isActive: {
    type: Boolean,
    default: true
  }
  // --- END NEW FIELD ---

}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
