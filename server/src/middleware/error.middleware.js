import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

/** 404 handler for unmatched routes. */
export function notFound(req, _res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

/**
 * Central error handler. Normalises Mongoose/JWT errors into clean JSON
 * and hides stack traces in production.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let details = err.details;

  // Mongoose validation → 400 with field messages.
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Duplicate key (unique index) → 409.
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `That ${field} is already taken`;
  }

  // Malformed ObjectId → 400.
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  }

  if (statusCode >= 500 && !env.isProd) {
    // Surface unexpected errors in the server log during development.
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    error: { message, ...(details ? { details } : {}) },
  });
}
