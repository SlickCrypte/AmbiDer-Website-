const Application = require('../models/Application');

// Create application
exports.createApplication = async (req, res) => {
  try {
    const { candidateId, jobId, coverLetter } = req.body;

    // Check if already applied
    const existing = await Application.findOne({
      candidate: candidateId,
      job: jobId
    });

    if (existing) {
      return res.status(400).json({ message: 'Already applied for this job' });
    }

    const application = await Application.create({
      candidate: candidateId,
      job: jobId,
      coverLetter
    });

    res.status(201).json({ message: 'Application submitted', application });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all applications
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
  .sort({ createdAt: -1 })
      .populate(
  'candidate',
  'name email phone skills experience education currentStatus resumeUrl'
)
      .populate('job', 'title location');
    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get single application
exports.getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate(
  'candidate',
  'name email phone skills experience education currentStatus resumeUrl'
)
      .populate('job', 'title location');
    if (!application) return res.status(404).json({ message: 'Application not found' });
    res.status(200).json(application);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get applications by job
exports.getApplicationsByJob = async (req, res) => {
  try {
    const applications = await Application.find({
  job: req.params.jobId
}).sort({ createdAt: -1 })
     .populate(
  'candidate',
  'name email phone skills experience education currentStatus resumeUrl'
);
    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get applications by candidate
exports.getApplicationsByCandidate = async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.params.candidateId })
      .populate('job', 'title location status');
    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update application status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!application) return res.status(404).json({ message: 'Application not found' });
    res.status(200).json({ message: 'Status updated', application });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete application
exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    res.status(200).json({ message: 'Application deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};