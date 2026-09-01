import { Router } from "express";
import {
  listFeed,
  getPost,
  createPost,
  deletePost,
  toggleLike,
  listComments,
  addComment,
  toggleBookmark,
  listBookmarks,
} from "../controllers/post.controller.js";
import { protect, optionalAuth, requireDb } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", requireDb, optionalAuth, listFeed);
router.post("/", requireDb, protect, createPost);

// Bookmarks collection for the current user (declared before :id).
router.get("/bookmarks/me", requireDb, protect, listBookmarks);

router.get("/:id", requireDb, optionalAuth, getPost);
router.delete("/:id", requireDb, protect, deletePost);

router.post("/:id/like", requireDb, protect, toggleLike);
router.post("/:id/bookmark", requireDb, protect, toggleBookmark);

router.get("/:id/comments", requireDb, optionalAuth, listComments);
router.post("/:id/comments", requireDb, protect, addComment);

export default router;
