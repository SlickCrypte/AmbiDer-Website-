const Interview = require('../models/Interview');
const Notification = require('../models/Notification');

// Schedule interview
exports.scheduleInterview = async (req, res) => {
  try {
    const interview = await Interview.create(req.body);

    // Create notification when interview is scheduled
    await Notification.create({
      message: `Interview scheduled for ${interview.scheduledAt}`,
      type: 'application',
      recipient: req.user.id,
      relatedJob: interview.job
    });

    res.status(201).json({ message: 'Interview scheduled', interview });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all interviews
exports.getAllInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find()
      .populate('application')
      .populate('candidate', 'name email phone')
      .populate('job', 'title location')
      .sort({ scheduledAt: 1 });
    res.status(200).json(interviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get single interview
exports.getInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('application')
      .populate('candidate', 'name email phone')
      .populate('job', 'title location');
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    res.status(200).json(interview);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update interview
exports.updateInterview = async (req, res) => {
  try {
    const interview = await Interview.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    res.status(200).json({ message: 'Interview updated', interview });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Cancel interview
exports.cancelInterview = async (req, res) => {
  try {
    const interview = await Interview.findByIdAndUpdate(
      req.params.id,
      { status: 'Cancelled' },
      { new: true }
    );
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Create notification when interview is cancelled
    await Notification.create({
      message: 'Interview has been cancelled',
      type: 'general',
      recipient: req.user.id,
      relatedJob: interview.job
    });

    res.status(200).json({ message: 'Interview cancelled', interview });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete interview
exports.deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findByIdAndDelete(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    res.status(200).json({ message: 'Interview deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};