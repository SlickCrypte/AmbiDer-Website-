const Candidate = require('../models/candidate');
const User = require('../models/user');
const parseResume = require('../utils/resumeParser');

// Upload Resume + Parse Resume
exports.uploadResume = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded"
      });
    }

    // Find logged-in user
    const user = await User.findById(req.user.id);

    if (!user || !user.candidateProfile) {
      return res.status(404).json({
        message: "Candidate profile not found"
      });
    }

    // Resume file path
    const resumeUrl = `uploads/${req.file.filename}`;

    // AI Resume Parsing
    const parsedData = await parseResume(req.file.path);

    // Save Resume URL + Parsed Data
    const candidate = await Candidate.findByIdAndUpdate(
      user.candidateProfile,
      {
        resumeUrl,
        parsedData
      },
      {
        returnDocument: "after"
      }
    );

    res.status(200).json({
      success: true,
      message: "Resume uploaded and parsed successfully",
      resumeUrl,
      parsedData,
      candidate
    });

  } catch (err) {

    console.error("Resume Parsing Error:", err);

    res.status(500).json({
      success: false,
      message: "Resume parsing failed",
      error: err.message
    });

  }
};

// Save Parsed Data Manually
exports.saveParsedData = async (req, res) => {
  try {

    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      {
        parsedData: req.body
      },
      {
        returnDocument: "after"
      }
    );

    if (!candidate) {
      return res.status(404).json({
        message: "Candidate not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Parsed data saved successfully",
      candidate
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message
    });

  }
};