import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";

/**
 * Runs after an express-validator chain. Collects any validation errors
 * and throws a 400 with structured field details.
 */
export function validate(req, _res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const details = result.array().map((e) => ({
    field: e.path,
    message: e.msg,
  }));
  next(ApiError.badRequest("Validation failed", details));
}
