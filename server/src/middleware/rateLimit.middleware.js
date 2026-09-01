import rateLimit from "express-rate-limit";

/** Global limiter — a sane ceiling for all API traffic. */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: "Too many requests, please slow down." },
  },
});

/** Stricter limiter for auth endpoints to blunt credential stuffing. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: "Too many authentication attempts. Try again later." },
  },
});

/** Limiter for the expensive AI / code-execution endpoints. */
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: "AI rate limit reached. Please wait a moment." },
  },
});
