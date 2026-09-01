import { Router } from "express";
import { analyze, assistantChat } from "../controllers/ai.controller.js";
import { runCode } from "../controllers/code.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { aiLimiter } from "../middleware/rateLimit.middleware.js";

const router = Router();

// AI code analysis + assistant chat (Gemini-backed, no DB needed).
router.post("/ai/analyze", protect, aiLimiter, analyze);
router.post("/ai/chat", protect, aiLimiter, assistantChat);

// Code execution (Judge0-backed, no DB needed).
router.post("/code/run", protect, aiLimiter, runCode);

export default router;
