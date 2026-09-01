/**
 * Minimal, dependency-free HTML sanitiser for user-supplied *text*
 * fields (captions, bios, comments). It escapes the characters that
 * enable stored-XSS so content can be rendered safely on the client.
 *
 * Note: code blocks are intentionally NOT run through this — they are
 * stored raw and rendered inside a syntax highlighter (which treats
 * them as text, never HTML). Escaping there would corrupt the code.
 */
const ESCAPE_MAP = {
  "<": "&lt;",
  ">": "&gt;",
};

export function escapeHtml(input) {
  if (typeof input !== "string") return input;
  return input.replace(/[<>]/g, (ch) => ESCAPE_MAP[ch]);
}

/** Recursively escape a set of string fields on a plain object. */
export function sanitizeFields(obj, fields) {
  if (!obj || typeof obj !== "object") return obj;
  for (const field of fields) {
    if (typeof obj[field] === "string") {
      obj[field] = escapeHtml(obj[field].trim());
    }
  }
  return obj;
}

/** Normalise a free-text tag list into clean, de-duped, lowercase tags. */
export function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  const seen = new Set();
  const out = [];
  for (const raw of tags) {
    if (typeof raw !== "string") continue;
    const t = raw.trim().replace(/^#/, "").slice(0, 40);
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
    if (out.length >= 12) break;
  }
  return out;
}
