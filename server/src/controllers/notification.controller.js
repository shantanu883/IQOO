import { Notification } from "../models/Notification.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/response.js";
import { getPagination, paginated } from "../utils/helpers.js";

export const listNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 20 });
  const filter = { recipient: req.user._id };
  if (req.query.unread === "true") filter.read = false;

  const [items, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("actor", "fullName username avatar isVerified")
      .lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ recipient: req.user._id, read: false }),
  ]);
  return ok(res, { ...paginated(items, total, { page, limit }), unreadCount });
});

export const markRead = asyncHandler(async (req, res) => {
  await Notification.updateOne(
    { _id: req.params.id, recipient: req.user._id },
    { read: true }
  );
  return ok(res, { message: "Marked as read" });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, read: false },
    { read: true }
  );
  return ok(res, { message: "All notifications marked as read" });
});
