import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ok } from "../utils/response.js";
import { analyzeCode, chat, isValidAction } from "../services/gemini.service.js";

/** POST /api/ai/analyze — run an AI action against a code snippet. */
export const analyze = asyncHandler(async (req, res) => {
  const { action, code, language } = req.body;
  if (!isValidAction(action)) {
    throw ApiError.badRequest(
      "Invalid action. Use one of: explain, bugs, optimize, improve, complexity, document"
    );
  }
  if (!code || typeof code !== "string") {
    throw ApiError.badRequest("Code is required");
  }
  if (code.length > 20000) throw ApiError.badRequest("Code is too long (20k char max)");

  const result = await analyzeCode({ action, code, language });
  return ok(res, result);
});

/** POST /api/ai/chat — developer assistant conversation. */
export const assistantChat = asyncHandler(async (req, res) => {
  const { message, history } = req.body;
  if (!message || typeof message !== "string") {
    throw ApiError.badRequest("A message is required");
  }
  const result = await chat({
    message,
    history: Array.isArray(history) ? history.slice(-10) : [],
  });
  return ok(res, result);
});
