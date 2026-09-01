import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ok } from "../utils/response.js";
import { executeCode, isRunnable } from "../services/judge0.service.js";
import { JUDGE0_LANGUAGE_IDS } from "../config/constants.js";

/** POST /api/code/run — execute a snippet via Judge0 (or simulate). */
export const runCode = asyncHandler(async (req, res) => {
  const { code, language, stdin } = req.body;
  if (!code) throw ApiError.badRequest("Code is required");
  if (!isRunnable(language)) {
    throw ApiError.badRequest(
      `Language "${language}" cannot be executed. Runnable: ${Object.keys(
        JUDGE0_LANGUAGE_IDS
      ).join(", ")}`
    );
  }
  const result = await executeCode({ code, language, stdin });
  return ok(res, result);
});
