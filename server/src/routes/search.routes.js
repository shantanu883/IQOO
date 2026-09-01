import { Router } from "express";
import { globalSearch } from "../controllers/search.controller.js";
import { requireDb } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", requireDb, globalSearch);

export default router;
