import { Router } from "express";
import {
  register,
  login,
  me,
  completeOnboarding,
  refresh,
  logout,
  forgotPassword,
  oauthStart,
  oauthCallback,
} from "../controllers/auth.controller.js";
import { protect, requireDb } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { authLimiter } from "../middleware/rateLimit.middleware.js";
import {
  registerRules,
  loginRules,
  forgotPasswordRules,
  onboardingRules,
} from "../validators/auth.validator.js";

const router = Router();

// Local auth
router.post("/register", authLimiter, requireDb, registerRules, validate, register);
router.post("/login", authLimiter, requireDb, loginRules, validate, login);
router.post("/logout", protect, logout);
router.post("/refresh", refresh);
router.get("/me", protect, me);
router.post(
  "/onboarding",
  protect,
  onboardingRules,
  validate,
  completeOnboarding
);
router.post(
  "/forgot-password",
  authLimiter,
  forgotPasswordRules,
  validate,
  forgotPassword
);

// OAuth — GitHub
router.get("/github", oauthStart("github"));
router.get("/github/callback", requireDb, oauthCallback("github"));

// OAuth — Google
router.get("/google", oauthStart("google"));
router.get("/google/callback", requireDb, oauthCallback("google"));

export default router;
