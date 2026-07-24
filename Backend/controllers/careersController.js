const Candidate = require('../models/candidate');
const Application = require('../models/Application');
const Job = require('../models/Job');

exports.getPublicJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'Open' }).sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.applyPublic = async (req, res) => {
  try {
    const { fullName, email, phone, experience, coverLetter, jobId } = req.body;

    if (!fullName || !email || !phone || !jobId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const job = await Job.findById(jobId).catch(() => null);
    const resumeUrl = req.file ? `uploads/${req.file.filename}` : undefined;

    let candidate = await Candidate.findOne({ email: email.toLowerCase().trim() });
    if (candidate) {
      candidate.name = fullName;
      candidate.phone = phone;
      candidate.experience = experience;
      if (job) candidate.appliedFor = job.title;
      if (resumeUrl) candidate.resumeUrl = resumeUrl;
      await candidate.save();
    } else {
      candidate = await Candidate.create({
        name: fullName,
        email: email.toLowerCase().trim(),
        phone,
        experience,
        appliedFor: job ? job.title : jobId,
        resumeUrl,
        currentStatus: 'Applied'
      });
    }

    if (job) {
      const existing = await Application.findOne({ candidate: candidate._id, job: job._id });
      if (existing) {
        return res.status(400).json({ message: 'Already applied for this job' });
      }
      await Application.create({
        candidate: candidate._id,
        job: job._id,
        coverLetter,
        status: 'Applied'
      });
    }

    res.status(201).json({ success: true, message: 'Application submitted' });
  } catch (err) {
    console.error('Public apply error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};