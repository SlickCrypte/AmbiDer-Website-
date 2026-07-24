const Candidate = require('../models/candidate');

// Dashboard Statistics
exports.getStats = async (req, res) => {
  try {
    const total = await Candidate.countDocuments();
    const applied = await Candidate.countDocuments({ currentStatus: 'Applied' });
    const screened = await Candidate.countDocuments({ currentStatus: 'Screened' });
    const interview = await Candidate.countDocuments({ currentStatus: 'Interview' });
    const hired = await Candidate.countDocuments({ currentStatus: 'Hired' });
    const rejected = await Candidate.countDocuments({ currentStatus: 'Rejected' });

    res.status(200).json({
      success: true,
      total,
      applied,
      screened,
      interview,
      hired,
      rejected
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// Dashboard Analytics
exports.getAnalytics = async (req, res) => {
  try {
    const totalCandidates = await Candidate.countDocuments();

    const statusData = await Candidate.aggregate([
      {
        $group: {
          _id: "$currentStatus",
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      totalCandidates,
      statusData
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Analytics fetch failed",
      error: err.message
    });
  }
};