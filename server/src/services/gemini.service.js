import axios from "axios";
import { env, features } from "../config/env.js";
import { AI_ACTIONS } from "../config/constants.js";

/**
 * Gemini-backed code analysis. When GEMINI_API_KEY is set we call the
 * real Generative Language API; otherwise we return a clearly-labelled
 * heuristic analysis so the "Ask AI" feature is demonstrable offline.
 * The mock is deterministic and derived from the actual code — it never
 * pretends to be a live model response.
 */

const PROMPTS = {
  explain:
    "Explain what this code does, step by step, in clear prose for a fellow developer.",
  bugs:
    "Review this code for bugs, edge cases, and correctness issues. List each concern and why it matters.",
  optimize:
    "Suggest concrete performance optimisations for this code. Show the key idea and expected impact.",
  improve:
    "Suggest readability and best-practice improvements (naming, structure, idioms) for this code.",
  complexity:
    "Analyse the time and space complexity of this code using Big-O notation and briefly justify it.",
  document:
    "Generate concise documentation/comments (function summary, params, returns) for this code.",
};

const ACTION_LABEL = {
  explain: "Explanation",
  bugs: "Potential Issues",
  optimize: "Optimisation",
  improve: "Suggested Improvements",
  complexity: "Complexity Analysis",
  document: "Generated Documentation",
};

export function isValidAction(action) {
  return AI_ACTIONS.includes(action);
}

async function callGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.gemini.model}:generateContent?key=${env.gemini.apiKey}`;
  const res = await axios.post(
    url,
    { contents: [{ parts: [{ text: prompt }] }] },
    { headers: { "Content-Type": "application/json" }, timeout: 20000 }
  );
  const text =
    res.data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ||
    "No response from the model.";
  return text;
}

/* ── deterministic offline analysis ──────────────────────────── */

function estimateComplexity(code) {
  const loops = (code.match(/\b(for|while|forEach|map|filter|reduce)\b/g) || [])
    .length;
  const nested = /for[\s\S]*?for|while[\s\S]*?while/.test(code);
  const recursion = /function\s+(\w+)[\s\S]*?\1\s*\(/.test(code);
  if (nested) return "O(n²)";
  if (recursion) return "O(2ⁿ) or O(n) depending on the recurrence";
  if (loops >= 1) return "O(n)";
  return "O(1)";
}

function mockAnalysis(action, code, language) {
  const lines = code.split("\n").length;
  const header = `> ⚠️ **Offline heuristic** — add \`GEMINI_API_KEY\` in \`server/.env\` for full AI analysis.\n\n`;
  const time = estimateComplexity(code);

  switch (action) {
    case "complexity":
      return (
        header +
        `**Time complexity:** ${time}\n\n` +
        `**Space complexity:** likely O(n) if intermediate collections are built, else O(1).\n\n` +
        `Heuristic based on detected loops/recursion across ${lines} lines of ${language}.`
      );
    case "bugs":
      return (
        header +
        `A quick static pass surfaced these things to check:\n\n` +
        `- Validate all inputs and guard against \`null\`/\`undefined\` before dereferencing.\n` +
        `- Confirm loop bounds — off-by-one errors are the most common defect here.\n` +
        `- Ensure errors/exceptions are handled rather than swallowed.\n` +
        `- Watch for shared mutable state if this runs concurrently.`
      );
    case "optimize":
      return (
        header +
        `Estimated current complexity is **${time}**.\n\n` +
        `- If you see nested iteration, replace inner lookups with a \`Map\`/\`Set\` to cut it toward O(n).\n` +
        `- Hoist invariant work out of loops.\n` +
        `- Prefer streaming/lazy evaluation for large inputs to reduce peak memory.`
      );
    case "improve":
      return (
        header +
        `- Use descriptive names for variables and functions.\n` +
        `- Extract repeated logic into small, single-purpose helpers.\n` +
        `- Add early returns to flatten deep nesting.\n` +
        `- Keep functions under ~30 lines where practical.`
      );
    case "document":
      return (
        header +
        "```" +
        language +
        "\n/**\n * TODO: one-line summary of what this does.\n * @param  ... describe each parameter\n * @returns ... describe the result\n */\n```\n" +
        `Documents the ${lines}-line snippet; fill the TODOs with specifics.`
      );
    case "explain":
    default:
      return (
        header +
        `This ${language} snippet spans ${lines} lines. At a high level it defines logic that transforms its inputs into a result. ` +
        `Detected control flow suggests an approximate **${time}** runtime. ` +
        `Connect a Gemini key to get a precise, line-by-line explanation.`
      );
  }
}

export async function analyzeCode({ action, code, language = "javascript" }) {
  const label = ACTION_LABEL[action] || "Analysis";

  if (!features.gemini) {
    return { action, label, result: mockAnalysis(action, code, language), mock: true };
  }

  const prompt = `${PROMPTS[action]}\n\nLanguage: ${language}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\``;
  const result = await callGemini(prompt);
  return { action, label, result, mock: false };
}

/** Free-form developer chat (AI Assistant page). */
export async function chat({ message, history = [] }) {
  if (!features.gemini) {
    return {
      reply:
        "> ⚠️ **Demo assistant** — add `GEMINI_API_KEY` in `server/.env` to enable the live model.\n\n" +
        `You asked: _"${message}"_.\n\nOnce connected, I can explain concepts, debug code, generate components, and help you prep for hackathons — with full code blocks and context from our conversation.`,
      mock: true,
    };
  }
  const convo = history
    .map((h) => `${h.role === "user" ? "User" : "Assistant"}: ${h.content}`)
    .join("\n");
  const prompt = `You are DevLoop's helpful senior-engineer AI assistant. Answer with correct, concise, well-formatted markdown and code blocks.\n\n${convo}\nUser: ${message}\nAssistant:`;
  const reply = await callGemini(prompt);
  return { reply, mock: false };
}
