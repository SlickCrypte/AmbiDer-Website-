/**
 * Resume Matching Engine
 * Pure backend logic — no AI used
 * Compares candidate skills against job required skills
 */

/**
 * Normalize a skill string for comparison
 * Lowercases and strips extra whitespace
 */
const normalizeSkill = (skill) => skill.trim().toLowerCase();

/**
 * Calculate matching percentage between candidate and job
 * @param {string[]} candidateSkills - skills from candidate profile
 * @param {string[]} jobSkills - required skills from job posting
 * @returns {{ matchingPercentage, matchedSkills, missingSkills }}
 */
const calculateMatch = (candidateSkills = [], jobSkills = []) => {
  if (!jobSkills || jobSkills.length === 0) {
    return {
      matchingPercentage: 0,
      matchedSkills: [],
      missingSkills: []
    };
  }

  const normalizedCandidateSkills = candidateSkills.map(normalizeSkill);
  const normalizedJobSkills = jobSkills.map(normalizeSkill);

  const matchedSkills = [];
  const missingSkills = [];

  normalizedJobSkills.forEach((jobSkill, index) => {
    const isMatched = normalizedCandidateSkills.some((candidateSkill) => {
      // Exact match OR job skill contains candidate skill OR vice versa
      return (
        candidateSkill === jobSkill ||
        candidateSkill.includes(jobSkill) ||
        jobSkill.includes(candidateSkill)
      );
    });

    if (isMatched) {
      matchedSkills.push(jobSkills[index]); // push original casing
    } else {
      missingSkills.push(jobSkills[index]);
    }
  });

  const matchingPercentage = Math.round(
    (matchedSkills.length / normalizedJobSkills.length) * 100
  );

  return {
    matchingPercentage,
    matchedSkills,
    missingSkills
  };
};

/**
 * Score a candidate for ranking purposes
 * @param {Object} candidate - Candidate document
 * @param {Object} matchResult - result from calculateMatch()
 * @returns {number} ranking score
 */
const calculateRankingScore = (candidate, matchResult) => {
  let score = 0;

  // 1. Matching percentage contributes most (0-50 points)
  score += (matchResult.matchingPercentage / 100) * 50;

  // 2. Experience (0-20 points)
  const expYears = parseFloat(candidate.experience) || 0;
  score += Math.min(expYears * 2, 20); // max 20 points (10 yrs+)

  // 3. Skills count (0-20 points)
  const skillCount = (candidate.skills || []).length;
  score += Math.min(skillCount * 2, 20); // max 20 points (10+ skills)

  // 4. Education (0-10 points)
  const edu = (candidate.education || '').toLowerCase();
  if (edu.includes('phd') || edu.includes('doctorate')) score += 10;
  else if (edu.includes('m.tech') || edu.includes('mba') || edu.includes('m.sc') || edu.includes('master')) score += 8;
  else if (edu.includes('b.tech') || edu.includes('b.e') || edu.includes('b.sc') || edu.includes('bachelor')) score += 6;
  else if (edu.includes('diploma')) score += 4;
  else if (edu) score += 2;

  return Math.round(score * 10) / 10; // round to 1 decimal
};

module.exports = { calculateMatch, calculateRankingScore };
