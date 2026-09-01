import { verifyAccessToken } from "../services/token.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { isDbConnected } from "../config/db.js";
import { User } from "../models/User.js";

/** Pull a bearer token from the Authorization header or the auth cookie. */
function extractToken(req) {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) return header.slice(7);
  if (req.cookies?.accessToken) return req.cookies.accessToken;
  return null;
}

/**
 * Require a valid access token. Loads the user and attaches it to
 * `req.user`. Responds 401 on any failure.
 */
export const protect = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized("Authentication required");

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw ApiError.unauthorized("Invalid or expired token");
  }

  const user = await User.findById(payload.sub);
  if (!user) throw ApiError.unauthorized("User no longer exists");

  req.user = user;
  next();
});

/**
 * Attach `req.user` if a valid token is present, but never block the
 * request. Used on feeds so we can flag which items the viewer liked.
 */
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (token) {
    try {
      const payload = verifyAccessToken(token);
      req.user = await User.findById(payload.sub);
    } catch {
      /* ignore — anonymous request */
    }
  }
  next();
});

/** Guard for routes that cannot work without the database. */
export const requireDb = (_req, _res, next) => {
  if (!isDbConnected()) {
    return next(
      ApiError.serviceUnavailable(
        "Database is not connected. Set MONGODB_URI in server/.env to enable this endpoint."
      )
    );
  }
  next();
};

/** Restrict to specific roles (e.g. admin-only routes). */
export const requireRole =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user || !req.user.roles?.some((r) => roles.includes(r))) {
      return next(ApiError.forbidden());
    }
    next();
  };
