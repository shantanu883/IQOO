import { Router } from "express";
import { getStreak, logBuild } from "../controllers/buildstreak.controller.js";
import { protect, requireDb } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", requireDb, protect, logBuild);
router.get("/:username", requireDb, getStreak);

export default router;
