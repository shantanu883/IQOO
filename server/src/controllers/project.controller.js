import { Project } from "../models/Project.js";
import { CollaborationRequest } from "../models/CollaborationRequest.js";
import { User } from "../models/User.js";
import { Notification } from "../models/Notification.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ok, created } from "../utils/response.js";
import { escapeHtml, normalizeTags } from "../utils/sanitize.js";
import { getPagination, paginated, slugify } from "../utils/helpers.js";

const OWNER_FIELDS = "fullName username avatar isVerified";

export const listProjects = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 9 });
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.tech) filter.techStack = req.query.tech;
  if (req.query.collab === "true") filter["collaboration.open"] = true;
  if (req.query.q) filter.$text = { $search: req.query.q };

  // ?username= scopes the list to one developer (used by the profile tab).
  if (req.query.username) {
    const owner = await User.findOne({
      username: String(req.query.username).toLowerCase(),
    }).select("_id");
    if (!owner) throw ApiError.notFound("Developer not found");
    filter.$or = [{ owner: owner._id }, { "team.user": owner._id }];
  }

  const sort =
    req.query.sort === "trending" ? { starsCount: -1 } : { createdAt: -1 };

  const [items, total] = await Promise.all([
    Project.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("owner", OWNER_FIELDS)
      .lean(),
    Project.countDocuments(filter),
  ]);
  return ok(res, paginated(items, total, { page, limit }));
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate("owner", OWNER_FIELDS)
    .populate("team.user", OWNER_FIELDS)
    .lean();
  if (!project) throw ApiError.notFound("Project not found");
  await Project.updateOne({ _id: project._id }, { $inc: { viewsCount: 1 } });

  const starred = req.user
    ? (project.starredBy || []).some((u) => String(u) === String(req.user._id))
    : false;
  return ok(res, { project, starred });
});

export const createProject = asyncHandler(async (req, res) => {
  const b = req.body;
  if (!b.name) throw ApiError.badRequest("Project name is required");

  const project = await Project.create({
    name: escapeHtml(b.name),
    slug: slugify(b.name),
    tagline: escapeHtml(b.tagline || ""),
    description: escapeHtml(b.description || ""),
    coverImage: b.coverImage || "",
    screenshots: Array.isArray(b.screenshots) ? b.screenshots.slice(0, 8) : [],
    demoVideo: b.demoVideo || "",
    githubUrl: b.githubUrl || "",
    liveUrl: b.liveUrl || "",
    techStack: normalizeTags(b.techStack),
    category: b.category || "Web",
    owner: req.user._id,
    team: [{ user: req.user._id, role: "Owner" }],
    collaboration: {
      open: Boolean(b.collaboration?.open),
      roles: Array.isArray(b.collaboration?.roles) ? b.collaboration.roles : [],
    },
  });

  await User.updateOne({ _id: req.user._id }, { $inc: { projectsCount: 1 } });
  const populated = await project.populate("owner", OWNER_FIELDS);
  return created(res, { project: populated.toJSON() });
});

/** Star / unstar toggle; keeps owner's aggregate star count in sync. */
export const toggleStar = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).select("owner starredBy starsCount");
  if (!project) throw ApiError.notFound("Project not found");

  const already = project.starredBy.some((u) => String(u) === String(req.user._id));
  if (already) {
    await Project.updateOne(
      { _id: project._id },
      { $pull: { starredBy: req.user._id }, $inc: { starsCount: -1 } }
    );
    await User.updateOne({ _id: project.owner }, { $inc: { starsCount: -1 } });
    return ok(res, { starred: false, starsCount: project.starsCount - 1 });
  }

  await Project.updateOne(
    { _id: project._id },
    { $addToSet: { starredBy: req.user._id }, $inc: { starsCount: 1 } }
  );
  await User.updateOne({ _id: project.owner }, { $inc: { starsCount: 1 } });
  if (String(project.owner) !== String(req.user._id)) {
    await Notification.create({
      recipient: project.owner,
      actor: req.user._id,
      type: "star",
      project: project._id,
      text: `${req.user.username} starred your project`,
    });
  }
  return ok(res, { starred: true, starsCount: project.starsCount + 1 });
});

/** Request to collaborate on a project (one open request per requester). */
export const requestCollaboration = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).select("owner collaboration name");
  if (!project) throw ApiError.notFound("Project not found");
  if (!project.collaboration?.open) {
    throw ApiError.badRequest("This project is not accepting collaborators");
  }
  if (String(project.owner) === String(req.user._id)) {
    throw ApiError.badRequest("You own this project");
  }

  const request = await CollaborationRequest.create({
    project: project._id,
    requester: req.user._id,
    owner: project.owner,
    role: req.body.role || "Other",
    message: escapeHtml(req.body.message || ""),
  }).catch((err) => {
    if (err.code === 11000) throw ApiError.conflict("You already requested to collaborate");
    throw err;
  });

  await Notification.create({
    recipient: project.owner,
    actor: req.user._id,
    type: "collab_request",
    project: project._id,
    text: `${req.user.username} wants to collaborate on ${project.name}`,
  });
  return created(res, { request: request.toJSON() });
});
