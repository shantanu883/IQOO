/**
 * Deterministic developer/teammate matching.
 *
 * Per the MVP requirement this is an explainable scoring function, NOT a
 * black-box ML model. It compares two users across shared technologies,
 * overlapping interests, experience proximity and hackathon availability,
 * and returns both a 0–100 score and human-readable reasons.
 */

const overlap = (a = [], b = []) => {
  const setB = new Set(b.map((x) => String(x).toLowerCase()));
  return a.filter((x) => setB.has(String(x).toLowerCase()));
};

const EXPERIENCE_RANK = { Beginner: 0, Intermediate: 1, Advanced: 2 };

export function scoreMatch(me, other) {
  const reasons = [];
  let score = 0;

  // Shared technologies — the strongest signal (up to 45 pts).
  const sharedTech = overlap(me.technologies, other.technologies);
  if (sharedTech.length) {
    score += Math.min(45, sharedTech.length * 15);
    reasons.push(
      `You both work with ${sharedTech.slice(0, 3).join(", ")}`
    );
  }

  // Shared interests (up to 25 pts).
  const sharedInterests = overlap(me.interests, other.interests);
  if (sharedInterests.length) {
    score += Math.min(25, sharedInterests.length * 10);
    reasons.push(
      `Shared interest in ${sharedInterests.slice(0, 2).join(" & ")}`
    );
  }

  // Experience proximity (up to 15 pts) — same or adjacent levels pair well.
  const ra = EXPERIENCE_RANK[me.experienceLevel];
  const rb = EXPERIENCE_RANK[other.experienceLevel];
  if (ra != null && rb != null) {
    const diff = Math.abs(ra - rb);
    if (diff === 0) {
      score += 15;
      reasons.push(`Both ${me.experienceLevel} level`);
    } else if (diff === 1) {
      score += 8;
    }
  }

  // Hackathon availability (up to 15 pts).
  if (me.hackathonAvailable && other.hackathonAvailable) {
    score += 15;
    reasons.push("Both open to hackathon teams");
  }

  // Complementary skills bonus — different interests can be a plus for teams.
  if (sharedTech.length && sharedInterests.length === 0) {
    score += 5;
    reasons.push("Complementary focus areas");
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  if (reasons.length === 0) reasons.push("New connection to explore");

  return { score, reasons, sharedTech, sharedInterests };
}

/** Rank a pool of candidates for a given user, best match first. */
export function rankMatches(me, candidates, limit = 10) {
  return candidates
    .filter((c) => String(c._id) !== String(me._id))
    .map((c) => {
      const { score, reasons } = scoreMatch(me, c);
      return { user: c, matchScore: score, matchReasons: reasons };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}
