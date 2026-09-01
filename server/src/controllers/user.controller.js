import { User } from "../models/User.js";
import { Post } from "../models/Post.js";
import { Project } from "../models/Project.js";
import { Notification } from "../models/Notification.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ok } from "../utils/response.js";
import { escapeHtml } from "../utils/sanitize.js";
import { getPagination, paginated } from "../utils/helpers.js";
import { rankMatches } from "../services/matching.service.js";
import { fetchGithubProfile } from "../services/github.service.js";

const CARD_FIELDS =
  "fullName username avatar bio skills technologies interests experienceLevel followersCount projectsCount isVerified hackathonAvailable location";

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username.toLowerCase() });
  if (!user) throw ApiError.notFound("Developer not found");

  const isFollowing = req.user
    ? user.followers.some((f) => String(f) === String(req.user._id))
    : false;

  return ok(res, { user: user.toJSON(), isFollowing });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const allowed = [
    "fullName",
    "bio",
    "location",
    "college",
    "company",
    "website",
    "linkedin",
    "avatar",
    "coverImage",
    "skills",
    "hackathonAvailable",
  ];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] === undefined) continue;
    updates[key] =
      typeof req.body[key] === "string" ? escapeHtml(req.body[key]) : req.body[key];
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });
  return ok(res, { user: user.toJSON() });
});

/** Follow / unfollow toggle keeping both sides' counts in sync. */
export const toggleFollow = asyncHandler(async (req, res) => {
  const target = await User.findOne({ username: req.params.username.toLowerCase() });
  if (!target) throw ApiError.notFound("Developer not found");
  if (String(target._id) === String(req.user._id)) {
    throw ApiError.badRequest("You cannot follow yourself");
  }

  const already = target.followers.some((f) => String(f) === String(req.user._id));

  if (already) {
    await Promise.all([
      User.updateOne(
        { _id: target._id },
        { $pull: { followers: req.user._id }, $inc: { followersCount: -1 } }
      ),
      User.updateOne(
        { _id: req.user._id },
        { $pull: { following: target._id }, $inc: { followingCount: -1 } }
      ),
    ]);
    return ok(res, { following: false });
  }

  await Promise.all([
    User.updateOne(
      { _id: target._id },
      { $addToSet: { followers: req.user._id }, $inc: { followersCount: 1 } }
    ),
    User.updateOne(
      { _id: req.user._id },
      { $addToSet: { following: target._id }, $inc: { followingCount: 1 } }
    ),
    Notification.create({
      recipient: target._id,
      actor: req.user._id,
      type: "follow",
      text: `${req.user.username} started following you`,
    }),
  ]);
  return ok(res, { following: true });
});

/** Developer discovery with filters (technology, experience, interest, etc.). */
export const listDevelopers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 12 });
  const filter = {};

  if (req.query.technology) filter.technologies = req.query.technology;
  if (req.query.interest) filter.interests = req.query.interest;
  if (req.query.experience) filter.experienceLevel = req.query.experience;
  if (req.query.location) filter.location = new RegExp(req.query.location, "i");
  if (req.query.hackathon === "true") filter.hackathonAvailable = true;
  if (req.query.q) filter.$text = { $search: req.query.q };

  const [items, total] = await Promise.all([
    User.find(filter)
      .sort({ followersCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(CARD_FIELDS)
      .lean(),
    User.countDocuments(filter),
  ]);
  return ok(res, paginated(items, total, { page, limit }));
});

/** Personalised teammate recommendations via the matching service. */
export const getRecommendations = asyncHandler(async (req, res) => {
  const limit = Math.min(20, parseInt(req.query.limit, 10) || 6);
  // Candidate pool: developers the user isn't already following.
  const pool = await User.find({
    _id: { $ne: req.user._id, $nin: req.user.following },
  })
    .select(CARD_FIELDS)
    .limit(80)
    .lean();

  const ranked = rankMatches(req.user, pool, limit);
  return ok(res, { recommendations: ranked });
});

export const getUserPosts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const user = await User.findOne({ username: req.params.username.toLowerCase() }).select("_id");
  if (!user) throw ApiError.notFound("Developer not found");

  const filter = { author: user._id };
  if (req.query.type) filter.type = req.query.type;

  const [items, total] = await Promise.all([
    Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "fullName username avatar isVerified")
      .lean(),
    Post.countDocuments(filter),
  ]);
  return ok(res, paginated(items, total, { page, limit }));
});

/**
 * Connect (or refresh) a GitHub account. Uses the real GitHub API — the
 * fetched stats are cached on the user document. We never fabricate data.
 */
export const connectGithub = asyncHandler(async (req, res) => {
  const username = req.body.username?.trim();
  if (!username) throw ApiError.badRequest("GitHub username required");

  const data = await fetchGithubProfile(username);
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      github: {
        username: data.username,
        connected: true,
        publicRepos: data.publicRepos,
        followers: data.followers,
        following: data.following,
        stars: data.stars,
        topLanguages: data.topLanguages,
        syncedAt: data.syncedAt,
      },
    },
    { new: true }
  );
  return ok(res, { user: user.toJSON(), github: data });
});

/** Fetch fresh public GitHub data for a connected profile. */
export const getGithub = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username.toLowerCase() });
  if (!user) throw ApiError.notFound("Developer not found");
  if (!user.github?.connected || !user.github?.username) {
    throw ApiError.badRequest("This developer has not connected GitHub");
  }
  const data = await fetchGithubProfile(user.github.username);
  return ok(res, { github: data });
});
