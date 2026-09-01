/**
 * Operational (expected) error carrying an HTTP status code.
 * Thrown from controllers/services and translated to a JSON response
 * by the central error middleware.
 */
export class ApiError extends Error {
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    if (details) this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }

  static badRequest(msg = "Bad request", details) {
    return new ApiError(400, msg, details);
  }
  static unauthorized(msg = "Not authenticated") {
    return new ApiError(401, msg);
  }
  static forbidden(msg = "Not authorised") {
    return new ApiError(403, msg);
  }
  static notFound(msg = "Resource not found") {
    return new ApiError(404, msg);
  }
  static conflict(msg = "Resource already exists") {
    return new ApiError(409, msg);
  }
  static serviceUnavailable(msg = "Service unavailable") {
    return new ApiError(503, msg);
  }
}
