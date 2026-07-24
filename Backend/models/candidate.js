const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  skills: [String],
  experience: { type: String },
  education: { type: String },
  currentStatus: {
    type: String,
    enum: ['Applied', 'Screened', 'Interview', 'Hired', 'Rejected'],
    default: 'Applied'
  },
  appliedFor: { type: String },
  resumeUrl: { type: String },
  parsedData: { type: Object }
}, { timestamps: true });

module.exports = mongoose.model('Candidate', candidateSchema);