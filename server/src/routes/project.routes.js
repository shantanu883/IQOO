import { Router } from "express";
import {
  listProjects,
  getProject,
  createProject,
  toggleStar,
  requestCollaboration,
} from "../controllers/project.controller.js";
import { protect, optionalAuth, requireDb } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", requireDb, optionalAuth, listProjects);
router.post("/", requireDb, protect, createProject);

router.get("/:id", requireDb, optionalAuth, getProject);
router.post("/:id/star", requireDb, protect, toggleStar);
router.post("/:id/collaborate", requireDb, protect, requestCollaboration);

export default router;
