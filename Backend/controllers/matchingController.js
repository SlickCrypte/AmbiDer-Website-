const Application = require('../models/Application');
const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const { calculateMatch, calculateRankingScore } = require('../services/matchingService');

/**
 * Match a single candidate against a job
 * POST /api/matching/match
 * Body: { candidateId, jobId }
 */
exports.matchCandidateToJob = async (req, res) => {
  try {
    const { candidateId, jobId } = req.body;

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const result = calculateMatch(candidate.skills, job.requiredSkills);

    // Save matching percentage to application if it exists
    const application = await Application.findOne({ candidate: candidateId, job: jobId });
    if (application) {
      application.matchingPercentage = result.matchingPercentage;
      application.matchedSkills = result.matchedSkills;
      application.missingSkills = result.missingSkills;
      await application.save();
    }

    res.status(200).json({
      candidateId,
      jobId,
      candidateName: candidate.name,
      jobTitle: job.title,
      ...result
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * Run matching for ALL candidates who applied for a job
 * POST /api/matching/job/:jobId/match-all
 */
exports.matchAllCandidatesForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const applications = await Application.find({ job: req.params.jobId })
      .populate('candidate', 'name skills experience education');

    if (applications.length === 0) {
      return res.status(200).json({ message: 'No applications found for this job', results: [] });
    }

    const results = [];

    for (const app of applications) {
      if (!app.candidate) continue;

      const result = calculateMatch(app.candidate.skills, job.requiredSkills);

      // Save to application document
      app.matchingPercentage = result.matchingPercentage;
      app.matchedSkills = result.matchedSkills;
      app.missingSkills = result.missingSkills;
      await app.save();

      results.push({
        applicationId: app._id,
        candidateId: app.candidate._id,
        candidateName: app.candidate.name,
        ...result
      });
    }

    // Sort by matching percentage descending
    results.sort((a, b) => b.matchingPercentage - a.matchingPercentage);

    res.status(200).json({
      jobId: req.params.jobId,
      jobTitle: job.title,
      totalApplications: results.length,
      results
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * Get ranked candidates for a specific job
 * GET /api/applications/job/:jobId/ranking
 * Sorted by: matchingPercentage → experience → education → skills count
 */
exports.getRankedCandidates = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const applications = await Application.find({ job: req.params.jobId })
      .populate('candidate', 'name email phone skills experience education resumeUrl currentStatus');

    if (applications.length === 0) {
      return res.status(200).json({ message: 'No applications for this job', ranking: [] });
    }

    const ranked = applications
      .filter(app => app.candidate)
      .map(app => {
        // If matching not yet calculated, calculate now
        let matchResult = {
          matchingPercentage: app.matchingPercentage || 0,
          matchedSkills: app.matchedSkills || [],
          missingSkills: app.missingSkills || []
        };

        if (!app.matchingPercentage) {
          matchResult = calculateMatch(app.candidate.skills, job.requiredSkills);
        }

        const rankingScore = calculateRankingScore(app.candidate, matchResult);

        return {
          rank: 0, // will be set after sort
          applicationId: app._id,
          applicationStatus: app.status,
          candidate: {
            id: app.candidate._id,
            name: app.candidate.name,
            email: app.candidate.email,
            skills: app.candidate.skills,
            experience: app.candidate.experience,
            education: app.candidate.education,
            skillsCount: (app.candidate.skills || []).length
          },
          matchingPercentage: matchResult.matchingPercentage,
          matchedSkills: matchResult.matchedSkills,
          missingSkills: matchResult.missingSkills,
          rankingScore
        };
      })
      .sort((a, b) => b.rankingScore - a.rankingScore)
      .map((item, index) => ({ ...item, rank: index + 1 }));

    res.status(200).json({
      jobId: req.params.jobId,
      jobTitle: job.title,
      totalCandidates: ranked.length,
      ranking: ranked
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
