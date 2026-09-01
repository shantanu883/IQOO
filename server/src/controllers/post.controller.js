import { Post } from "../models/Post.js";
import { Like } from "../models/Like.js";
import { Comment } from "../models/Comment.js";
import { Bookmark } from "../models/Bookmark.js";
import { User } from "../models/User.js";
import { Notification } from "../models/Notification.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ok, created } from "../utils/response.js";
import { escapeHtml, normalizeTags } from "../utils/sanitize.js";
import { getPagination, paginated } from "../utils/helpers.js";

const AUTHOR_FIELDS = "fullName username avatar isVerified";

/** Attach `liked`/`bookmarked` flags for the viewing user. */
async function withViewerState(posts, userId) {
  if (!userId) return posts.map((p) => ({ ...p, liked: false, bookmarked: false }));
  const ids = posts.map((p) => p._id);
  const [likes, bookmarks] = await Promise.all([
    Like.find({ user: userId, target: { $in: ids }, targetType: "Post" }).select("target"),
    Bookmark.find({ user: userId, post: { $in: ids } }).select("post"),
  ]);
  const likedSet = new Set(likes.map((l) => String(l.target)));
  const bmSet = new Set(bookmarks.map((b) => String(b.post)));
  return posts.map((p) => ({
    ...p,
    liked: likedSet.has(String(p._id)),
    bookmarked: bmSet.has(String(p._id)),
  }));
}

export const listFeed = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.type) filter.type = req.query.type;
  if (req.query.author) filter.author = req.query.author;
  if (req.query.tag) filter.tags = req.query.tag.toLowerCase();

  const [docs, total] = await Promise.all([
    Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", AUTHOR_FIELDS)
      .populate("project", "name slug coverImage techStack starsCount")
      .lean(),
    Post.countDocuments(filter),
  ]);

  const items = await withViewerState(docs, req.user?._id);
  return ok(res, paginated(items, total, { page, limit }));
});

export const getPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate("author", AUTHOR_FIELDS)
    .populate("project", "name slug coverImage techStack starsCount")
    .lean();
  if (!post) throw ApiError.notFound("Post not found");

  await Post.updateOne({ _id: post._id }, { $inc: { viewsCount: 1 } });
  const [item] = await withViewerState([post], req.user?._id);
  return ok(res, { post: item });
});

export const createPost = asyncHandler(async (req, res) => {
  const { type = "post", caption = "", tags, code, achievement, media } = req.body;

  const payload = {
    author: req.user._id,
    type,
    caption: escapeHtml(caption),
    tags: normalizeTags(tags),
  };

  if (type === "code") {
    if (!code?.code) throw ApiError.badRequest("Code posts require a code body");
    payload.code = {
      title: escapeHtml(code.title || ""),
      description: escapeHtml(code.description || ""),
      language: code.language || "javascript",
      code: code.code, // stored raw; rendered as text by the highlighter
    };
  }
  if (type === "achievement" && achievement) payload.achievement = achievement;
  if (media) payload.media = media;

  const post = await Post.create(payload);
  await User.updateOne({ _id: req.user._id }, { $inc: { postsCount: 1 } });
  const populated = await post.populate("author", AUTHOR_FIELDS);
  return created(res, { post: populated.toJSON() });
});

export const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw ApiError.notFound("Post not found");
  if (String(post.author) !== String(req.user._id)) throw ApiError.forbidden();

  await Promise.all([
    post.deleteOne(),
    Comment.deleteMany({ post: post._id }),
    Like.deleteMany({ target: post._id, targetType: "Post" }),
    Bookmark.deleteMany({ post: post._id }),
    User.updateOne({ _id: req.user._id }, { $inc: { postsCount: -1 } }),
  ]);
  return ok(res, { message: "Post deleted" });
});

/** Idempotent like toggle backed by the unique (user, target) index. */
export const toggleLike = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).select("author likesCount");
  if (!post) throw ApiError.notFound("Post not found");

  const existing = await Like.findOne({
    user: req.user._id,
    target: post._id,
    targetType: "Post",
  });

  let liked;
  if (existing) {
    await existing.deleteOne();
    await Post.updateOne({ _id: post._id }, { $inc: { likesCount: -1 } });
    liked = false;
  } else {
    await Like.create({ user: req.user._id, target: post._id, targetType: "Post" });
    await Post.updateOne({ _id: post._id }, { $inc: { likesCount: 1 } });
    liked = true;
    // Notify the author (but not for self-likes).
    if (String(post.author) !== String(req.user._id)) {
      await Notification.create({
        recipient: post.author,
        actor: req.user._id,
        type: "like",
        post: post._id,
        text: `${req.user.username} liked your post`,
      });
    }
  }

  const fresh = await Post.findById(post._id).select("likesCount");
  return ok(res, { liked, likesCount: fresh.likesCount });
});

export const listComments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 20 });
  const [items, total] = await Promise.all([
    Comment.find({ post: req.params.id, parent: null })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", AUTHOR_FIELDS)
      .lean(),
    Comment.countDocuments({ post: req.params.id, parent: null }),
  ]);
  return ok(res, paginated(items, total, { page, limit }));
});

export const addComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).select("author commentsCount");
  if (!post) throw ApiError.notFound("Post not found");

  const comment = await Comment.create({
    post: post._id,
    author: req.user._id,
    text: escapeHtml(req.body.text || ""),
    parent: req.body.parent || null,
  });
  await Post.updateOne({ _id: post._id }, { $inc: { commentsCount: 1 } });

  if (String(post.author) !== String(req.user._id)) {
    await Notification.create({
      recipient: post.author,
      actor: req.user._id,
      type: "comment",
      post: post._id,
      text: `${req.user.username} commented on your post`,
    });
  }

  const populated = await comment.populate("author", AUTHOR_FIELDS);
  return created(res, { comment: populated.toJSON() });
});

export const toggleBookmark = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).select("bookmarksCount");
  if (!post) throw ApiError.notFound("Post not found");

  const existing = await Bookmark.findOne({ user: req.user._id, post: post._id });
  let bookmarked;
  if (existing) {
    await existing.deleteOne();
    await Post.updateOne({ _id: post._id }, { $inc: { bookmarksCount: -1 } });
    bookmarked = false;
  } else {
    await Bookmark.create({ user: req.user._id, post: post._id });
    await Post.updateOne({ _id: post._id }, { $inc: { bookmarksCount: 1 } });
    bookmarked = true;
  }
  return ok(res, { bookmarked });
});

export const listBookmarks = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const [bms, total] = await Promise.all([
    Bookmark.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "post",
        populate: { path: "author", select: AUTHOR_FIELDS },
      })
      .lean(),
    Bookmark.countDocuments({ user: req.user._id }),
  ]);
  const posts = bms.map((b) => b.post).filter(Boolean);
  const items = await withViewerState(posts, req.user._id);
  return ok(res, paginated(items, total, { page, limit }));
});
