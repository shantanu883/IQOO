import { BuildStreak } from "../models/BuildStreak.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ok, created } from "../utils/response.js";
import { escapeHtml, normalizeTags } from "../utils/sanitize.js";

const todayKey = () => new Date().toISOString().slice(0, 10);

/** GET /api/streaks/:username — a developer's build history + stats. */
export const getStreak = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    username: req.params.username.toLowerCase(),
  }).select("_id");
  if (!user) throw ApiError.notFound("Developer not found");

  const streak =
    (await BuildStreak.findOne({ user: user._id }).lean()) || {
      user: user._id,
      entries: [],
      currentStreak: 0,
      longestStreak: 0,
    };
  return ok(res, { streak });
});

/** POST /api/streaks — log what you built today (protected). */
export const logBuild = asyncHandler(async (req, res) => {
  const { title, description, tags, date } = req.body;
  if (!title) throw ApiError.badRequest("What did you build? A title is required");

  let streak = await BuildStreak.findOne({ user: req.user._id });
  if (!streak) streak = new BuildStreak({ user: req.user._id, entries: [] });

  streak.entries.push({
    date: date || todayKey(),
    title: escapeHtml(title),
    description: escapeHtml(description || ""),
    tags: normalizeTags(tags),
  });
  streak.recomputeStreaks();
  await streak.save();

  return created(res, { streak: streak.toJSON() });
});
