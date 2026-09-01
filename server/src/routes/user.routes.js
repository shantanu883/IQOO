import { Router } from "express";
import {
  getProfile,
  updateProfile,
  toggleFollow,
  listDevelopers,
  getRecommendations,
  getUserPosts,
  connectGithub,
  getGithub,
} from "../controllers/user.controller.js";
import { protect, optionalAuth, requireDb } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", requireDb, optionalAuth, listDevelopers);
router.get("/recommendations", requireDb, protect, getRecommendations);

router.patch("/me", requireDb, protect, updateProfile);
router.post("/me/github", requireDb, protect, connectGithub);

router.get("/:username", requireDb, optionalAuth, getProfile);
router.get("/:username/posts", requireDb, optionalAuth, getUserPosts);
router.get("/:username/github", requireDb, getGithub);
router.post("/:username/follow", requireDb, protect, toggleFollow);

export default router;
