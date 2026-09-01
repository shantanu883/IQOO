import { User } from "../models/User.js";
import { Post } from "../models/Post.js";
import { Project } from "../models/Project.js";
import { Hackathon } from "../models/Hackathon.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/response.js";

/**
 * GET /api/search?q=... — grouped global search across the platform.
 * Uses a case-insensitive regex so partial/prefix queries work well for
 * an as-you-type search box.
 */
export const globalSearch = asyncHandler(async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return ok(res, { people: [], posts: [], projects: [], hackathons: [] });

  const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  const limit = 6;

  const [people, posts, projects, hackathons] = await Promise.all([
    User.find({ $or: [{ username: rx }, { fullName: rx }, { skills: rx }] })
      .limit(limit)
      .select("fullName username avatar bio isVerified followersCount")
      .lean(),
    Post.find({ $or: [{ caption: rx }, { tags: rx }, { "code.title": rx }] })
      .limit(limit)
      .populate("author", "fullName username avatar")
      .select("type caption tags code.title author createdAt likesCount")
      .lean(),
    Project.find({ $or: [{ name: rx }, { tagline: rx }, { techStack: rx }] })
      .limit(limit)
      .populate("owner", "username avatar")
      .select("name slug tagline techStack starsCount coverImage owner")
      .lean(),
    Hackathon.find({ $or: [{ name: rx }, { technologies: rx }] })
      .limit(limit)
      .select("name organizer mode prize registrationDeadline technologies")
      .lean(),
  ]);

  return ok(res, { query: q, people, posts, projects, hackathons });
});
