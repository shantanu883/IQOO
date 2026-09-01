import { Router } from "express";
import {
  listNotifications,
  markRead,
  markAllRead,
} from "../controllers/notification.controller.js";
import { protect, requireDb } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", requireDb, protect, listNotifications);
router.patch("/read-all", requireDb, protect, markAllRead);
router.patch("/:id/read", requireDb, protect, markRead);

export default router;
