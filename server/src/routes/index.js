import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import postRoutes from "./post.routes.js";
import projectRoutes from "./project.routes.js";
import hackathonRoutes from "./hackathon.routes.js";
import notificationRoutes from "./notification.routes.js";
import streakRoutes from "./streak.routes.js";
import searchRoutes from "./search.routes.js";
import toolsRoutes from "./tools.routes.js";
import { features } from "../config/env.js";
import { isDbConnected } from "../config/db.js";

const router = Router();

/** Service status + which integrations are configured. */
router.get("/status", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      time: new Date().toISOString(),
      db: isDbConnected(),
      integrations: {
        githubOAuth: features.githubOAuth,
        googleOAuth: features.googleOAuth,
        gemini: features.gemini,
        judge0: features.judge0,
      },
    },
  });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/posts", postRoutes);
router.use("/projects", projectRoutes);
router.use("/hackathons", hackathonRoutes);
router.use("/notifications", notificationRoutes);
router.use("/streaks", streakRoutes);
router.use("/search", searchRoutes);
// AI analyze/chat + code run live under /api/ai and /api/code.
router.use("/", toolsRoutes);

export default router;
