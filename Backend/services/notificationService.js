const Notification = require('../models/Notification');

/**
 * Central notification service
 * Call these functions from controllers when events happen
 */

// Application submitted notification
const notifyApplicationSubmitted = async (recruiterId, candidateName, jobTitle, candidateId, jobId) => {
  try {
    await Notification.create({
      message: `${candidateName} has applied for ${jobTitle}`,
      type: 'application',
      recipient: recruiterId,
      relatedCandidate: candidateId,
      relatedJob: jobId,
      isRead: false
    });
  } catch (err) {
    console.error('Notification error (application submitted):', err.message);
  }
};

// Interview scheduled notification
const notifyInterviewScheduled = async (recipientId, candidateName, jobTitle, scheduledAt, candidateId, jobId) => {
  try {
    const dateStr = new Date(scheduledAt).toDateString();
    await Notification.create({
      message: `Interview scheduled for ${candidateName} (${jobTitle}) on ${dateStr}`,
      type: 'application',
      recipient: recipientId,
      relatedCandidate: candidateId,
      relatedJob: jobId,
      isRead: false
    });
  } catch (err) {
    console.error('Notification error (interview scheduled):', err.message);
  }
};

// Application status changed notification
const notifyStatusChanged = async (recipientId, candidateName, jobTitle, newStatus, candidateId, jobId) => {
  try {
    await Notification.create({
      message: `Application status for ${candidateName} on ${jobTitle} changed to ${newStatus}`,
      type: 'status_change',
      recipient: recipientId,
      relatedCandidate: candidateId,
      relatedJob: jobId,
      isRead: false
    });
  } catch (err) {
    console.error('Notification error (status changed):', err.message);
  }
};

// Job closed notification
const notifyJobClosed = async (recipientId, jobTitle, jobId) => {
  try {
    await Notification.create({
      message: `Job posting "${jobTitle}" has been closed`,
      type: 'general',
      recipient: recipientId,
      relatedJob: jobId,
      isRead: false
    });
  } catch (err) {
    console.error('Notification error (job closed):', err.message);
  }
};

// New candidate added notification
const notifyNewCandidate = async (recipientId, candidateName, candidateId) => {
  try {
    await Notification.create({
      message: `New candidate ${candidateName} has been added to the system`,
      type: 'new_candidate',
      recipient: recipientId,
      relatedCandidate: candidateId,
      isRead: false
    });
  } catch (err) {
    console.error('Notification error (new candidate):', err.message);
  }
};

module.exports = {
  notifyApplicationSubmitted,
  notifyInterviewScheduled,
  notifyStatusChanged,
  notifyJobClosed,
  notifyNewCandidate
};
