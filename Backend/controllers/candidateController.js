const Candidate = require('../models/candidate');

// Add new candidate
exports.addCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.create(req.body);
    res.status(201).json({ message: 'Candidate added', candidate });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all candidates
exports.getAllCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find();
    res.status(200).json(candidates);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get single candidate
exports.getCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    res.status(200).json(candidate);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update candidate
exports.updateCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    res.status(200).json({ message: 'Candidate updated', candidate });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete candidate
exports.deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    res.status(200).json({ message: 'Candidate deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update candidate status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      { currentStatus: status },
      { new: true }
    );
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    res.status(200).json({ message: 'Status updated', candidate });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Search and filter candidates
// Search and filter candidates
exports.searchCandidates = async (req, res) => {
  try {
    const {
      name,
      skills,
      status,
      experience,
      education
    } = req.query;

    let query = {};

    // Search by name
    if (name) {
      query.name = {
        $regex: name,
        $options: "i"
      };
    }

    // Search by skills
    if (skills) {
      query.skills = {
        $in: skills.split(",").map(skill => skill.trim())
      };
    }

    // Filter by status
    if (status) {
      query.currentStatus = status;
    }

    // Filter by experience
    if (experience) {
      query.experience = {
        $regex: experience,
        $options: "i"
      };
    }

    // Filter by education
    if (education) {
      query.education = {
        $regex: education,
        $options: "i"
      };
    }

    const candidates = await Candidate.find(query);

    res.status(200).json({
      total: candidates.length,
      candidates
    });

  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};