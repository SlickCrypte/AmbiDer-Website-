const Candidate = require('../models/Candidate');
const Application = require('../models/Application');

/**
 * Advanced Candidate Search
 * GET /api/search/candidates
 *
 * Query params:
 *   name        - search by name (partial match)
 *   skill       - search by skill (partial match)
 *   education   - search by education level
 *   experience  - minimum years of experience
 *   location    - search by location
 *   minMatch    - minimum matching percentage (requires jobId)
 *   jobId       - job to compare matching % against
 *   status      - current hiring status
 *   page        - page number (default 1)
 *   limit       - results per page (default 10)
 */
exports.searchCandidates = async (req, res) => {
  try {
    const {
      name,
      skill,
      education,
      experience,
      location,
      minMatch,
      jobId,
      status,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    // Name search (case-insensitive partial match)
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }

    // Skill search (case-insensitive, any skill in array)
    if (skill) {
      query.skills = { $elemMatch: { $regex: skill, $options: 'i' } };
    }

    // Education search
    if (education) {
      query.education = { $regex: education, $options: 'i' };
    }

    // Experience (minimum years)
    if (experience) {
      // Experience stored as string like "2 years" — extract number
      query.$expr = {
        $gte: [
          { $toDouble: { $arrayElemAt: [{ $split: ['$experience', ' '] }, 0] } },
          parseFloat(experience)
        ]
      };
    }

    // Location search
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Status filter
    if (status) {
      query.currentStatus = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let candidates = await Candidate.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Candidate.countDocuments(query);

    // If minMatch and jobId provided, filter by matching %
    if (minMatch && jobId) {
      const { calculateMatch } = require('../services/matchingService');
      const Job = require('../models/Job');
      const job = await Job.findById(jobId);

      if (job) {
        candidates = candidates
          .map(c => {
            const match = calculateMatch(c.skills, job.requiredSkills);
            return { ...c.toObject(), matchingPercentage: match.matchingPercentage };
          })
          .filter(c => c.matchingPercentage >= parseFloat(minMatch));
      }
    }

    res.status(200).json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      candidates
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
