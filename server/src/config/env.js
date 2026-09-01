import dotenv from "dotenv";

dotenv.config();

/**
 * Centralised, typed-ish access to environment variables.
 * Everything funnels through here so the rest of the code never
 * touches `process.env` directly and defaults live in one place.
 */
const toBool = (v) => String(v).toLowerCase() === "true";

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProd: process.env.NODE_ENV === "production",
  port: Number(process.env.PORT || 5000),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",

  mongoUri: process.env.MONGODB_URI || "",

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "dev_access_secret_change_me",
    refreshSecret:
      process.env.JWT_REFRESH_SECRET || "dev_refresh_secret_change_me",
    accessExpires: process.env.JWT_ACCESS_EXPIRES || "15m",
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || "7d",
  },

  github: {
    clientId: process.env.GITHUB_CLIENT_ID || "",
    clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    callbackUrl:
      process.env.GITHUB_CALLBACK_URL ||
      "http://localhost:5000/api/auth/github/callback",
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackUrl:
      process.env.GOOGLE_CALLBACK_URL ||
      "http://localhost:5000/api/auth/google/callback",
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || "",
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
  },

  judge0: {
    url: process.env.JUDGE0_URL || "https://judge0-ce.p.rapidapi.com",
    apiKey: process.env.JUDGE0_API_KEY || "",
    apiHost: process.env.JUDGE0_API_HOST || "judge0-ce.p.rapidapi.com",
  },
};

/** Feature availability flags derived from configured secrets. */
export const features = {
  db: Boolean(env.mongoUri),
  githubOAuth: Boolean(env.github.clientId && env.github.clientSecret),
  googleOAuth: Boolean(env.google.clientId && env.google.clientSecret),
  gemini: Boolean(env.gemini.apiKey),
  judge0: Boolean(env.judge0.apiKey),
};

export const isDebug = toBool(process.env.DEBUG);
