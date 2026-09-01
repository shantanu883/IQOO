import { Hackathon } from "../models/Hackathon.js";
import { HackathonTeam } from "../models/HackathonTeam.js";
import { Notification } from "../models/Notification.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ok, created } from "../utils/response.js";
import { escapeHtml, normalizeTags } from "../utils/sanitize.js";
import { getPagination, paginated } from "../utils/helpers.js";

export const listHackathons = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 9 });
  const filter = {};
  if (req.query.tech) filter.technologies = req.query.tech;
  if (req.query.mode) filter.mode = req.query.mode;
  if (req.query.q) filter.$text = { $search: req.query.q };

  const [items, total] = await Promise.all([
    Hackathon.find(filter)
      .sort({ registrationDeadline: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Hackathon.countDocuments(filter),
  ]);
  return ok(res, paginated(items, total, { page, limit }));
});

export const getHackathon = asyncHandler(async (req, res) => {
  const hackathon = await Hackathon.findById(req.params.id).lean();
  if (!hackathon) throw ApiError.notFound("Hackathon not found");
  return ok(res, { hackathon });
});

/** Teams looking for members for a given hackathon. */
export const listTeams = asyncHandler(async (req, res) => {
  const filter = { hackathon: req.params.id };
  if (req.query.status) filter.status = req.query.status;
  const teams = await HackathonTeam.find(filter)
    .sort({ createdAt: -1 })
    .populate("owner", "fullName username avatar isVerified")
    .populate("members", "fullName username avatar")
    .lean();
  return ok(res, { teams });
});

export const createTeam = asyncHandler(async (req, res) => {
  const b = req.body;
  if (!b.projectIdea) throw ApiError.badRequest("A project idea is required");

  const team = await HackathonTeam.create({
    hackathon: req.params.id,
    owner: req.user._id,
    projectIdea: escapeHtml(b.projectIdea),
    description: escapeHtml(b.description || ""),
    members: [req.user._id],
    skills: normalizeTags(b.skills),
    openRoles: Array.isArray(b.openRoles) ? b.openRoles : [],
  });
  const populated = await team.populate("owner", "fullName username avatar isVerified");
  return created(res, { team: populated.toJSON() });
});

/** Send a request to join a team. */
export const joinTeam = asyncHandler(async (req, res) => {
  const team = await HackathonTeam.findById(req.params.teamId);
  if (!team) throw ApiError.notFound("Team not found");
  if (team.members.some((m) => String(m) === String(req.user._id))) {
    throw ApiError.badRequest("You are already on this team");
  }
  if (team.applicants.some((a) => String(a.user) === String(req.user._id))) {
    throw ApiError.conflict("You already requested to join this team");
  }

  team.applicants.push({
    user: req.user._id,
    role: req.body.role || "Other",
    message: escapeHtml(req.body.message || ""),
  });
  await team.save();

  await Notification.create({
    recipient: team.owner,
    actor: req.user._id,
    type: "team_invite",
    text: `${req.user.username} wants to join your team "${team.projectIdea}"`,
  });
  return created(res, { message: "Join request sent" });
});
