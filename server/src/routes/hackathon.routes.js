import { Router } from "express";
import {
  listHackathons,
  getHackathon,
  listTeams,
  createTeam,
  joinTeam,
} from "../controllers/hackathon.controller.js";
import { protect, requireDb } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", requireDb, listHackathons);
router.get("/:id", requireDb, getHackathon);

router.get("/:id/teams", requireDb, listTeams);
router.post("/:id/teams", requireDb, protect, createTeam);
router.post("/:id/teams/:teamId/join", requireDb, protect, joinTeam);

export default router;
