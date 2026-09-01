import axios from "axios";
import { env, features } from "../config/env.js";
import { JUDGE0_LANGUAGE_IDS } from "../config/constants.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Judge0 code execution. With JUDGE0_API_KEY configured we submit to the
 * real API and wait for the verdict; without it we return a simulated
 * result clearly flagged as such (so "Run Code" is demonstrable offline).
 */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function isRunnable(language) {
  return language in JUDGE0_LANGUAGE_IDS;
}

async function runWithJudge0({ code, language, stdin }) {
  const languageId = JUDGE0_LANGUAGE_IDS[language];
  const headers = {
    "content-type": "application/json",
    "X-RapidAPI-Key": env.judge0.apiKey,
    "X-RapidAPI-Host": env.judge0.apiHost,
  };

  const { data: created } = await axios.post(
    `${env.judge0.url}/submissions?base64_encoded=false&wait=false`,
    { source_code: code, language_id: languageId, stdin: stdin || "" },
    { headers }
  );

  // Poll for the result.
  const token = created.token;
  for (let i = 0; i < 10; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await sleep(700);
    // eslint-disable-next-line no-await-in-loop
    const { data } = await axios.get(
      `${env.judge0.url}/submissions/${token}?base64_encoded=false`,
      { headers }
    );
    if (data.status && data.status.id >= 3) {
      return {
        status: data.status.description,
        stdout: data.stdout || "",
        stderr: data.stderr || data.compile_output || "",
        time: data.time ? `${data.time}s` : null,
        memory: data.memory ? `${data.memory} KB` : null,
        mock: false,
      };
    }
  }
  throw ApiError.serviceUnavailable("Code execution timed out");
}

/** Very small offline simulator: echoes stdout for print statements. */
function simulateRun({ code, language, stdin }) {
  const start = Date.now();
  const outputs = [];
  const patterns = [
    /print\((?:f?["'])([^"']*)["']/g, // python
    /console\.log\((?:[`"'])([^`"']*)[`"']/g, // js/ts
    /System\.out\.println\(\s*"([^"]*)"/g, // java
    /(?:cout\s*<<\s*)"([^"]*)"/g, // c++
    /printf\(\s*"([^"\\]*)/g, // c
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(code)) !== null) outputs.push(m[1]);
  }

  const stdout = outputs.length
    ? outputs.join("\n") + "\n"
    : "// Simulated run — no printable output detected.\n// Add JUDGE0_API_KEY in server/.env for real execution.\n";

  return {
    status: "Accepted (simulated)",
    stdout: stdin ? `${stdout}` : stdout,
    stderr: "",
    time: `${((Date.now() - start) / 1000 + 0.01).toFixed(3)}s`,
    memory: "—",
    mock: true,
  };
}

export async function executeCode({ code, language, stdin = "" }) {
  if (!isRunnable(language)) {
    throw ApiError.badRequest(`Language "${language}" is not executable`);
  }
  if (!features.judge0) return simulateRun({ code, language, stdin });
  return runWithJudge0({ code, language, stdin });
}
