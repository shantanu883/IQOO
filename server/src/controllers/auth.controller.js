import crypto from "crypto";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ok, created } from "../utils/response.js";
import { escapeHtml } from "../utils/sanitize.js";
import { env } from "../config/env.js";
import {
  issueTokens,
  verifyRefreshToken,
} from "../services/token.service.js";
import {
  getGithubAuthUrl,
  getGoogleAuthUrl,
  exchangeGithubCode,
  exchangeGoogleCode,
} from "../services/oauth.service.js";

/* ── helpers ─────────────────────────────────────────────────── */

const sha256 = (val) => crypto.createHash("sha256").update(val).digest("hex");

const cookieBase = {
  httpOnly: true,
  sameSite: "lax",
  secure: env.isProd,
};

function setAuthCookies(res, { accessToken, refreshToken }) {
  res.cookie("accessToken", accessToken, {
    ...cookieBase,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    ...cookieBase,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  });
}

function clearAuthCookies(res) {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken", { path: "/api/auth" });
}

/** Issue tokens, persist the hashed refresh token, set cookies. */
async function establishSession(res, user) {
  const tokens = issueTokens(user);
  user.refreshTokens = [
    ...(user.refreshTokens || []).slice(-4), // keep last few sessions
    sha256(tokens.refreshToken),
  ];
  user.lastActiveAt = new Date();
  await user.save();
  setAuthCookies(res, tokens);
  return tokens;
}

/** Suggest a free username derived from a desired base. */
async function uniqueUsername(base) {
  let candidate = base.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 24) || "dev";
  let n = 0;
  // eslint-disable-next-line no-await-in-loop
  while (await User.exists({ username: candidate })) {
    n += 1;
    candidate = `${base.slice(0, 20)}${n}`;
  }
  return candidate;
}

/* ── email / password ────────────────────────────────────────── */

export const register = asyncHandler(async (req, res) => {
  const { fullName, username, email, password } = req.body;

  const exists = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
  });
  if (exists) {
    throw ApiError.conflict(
      exists.email === email.toLowerCase()
        ? "An account with that email already exists"
        : "That username is taken"
    );
  }

  const user = await User.create({
    fullName: escapeHtml(fullName),
    username,
    email,
    passwordHash: password, // hashed by the model's pre-save hook
    avatar: `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(
      username
    )}`,
  });

  const { accessToken } = await establishSession(res, user);
  return created(res, { user: user.toJSON(), accessToken });
});

export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  const key = identifier.toLowerCase();

  const user = await User.findOne({
    $or: [{ email: key }, { username: key }],
  }).select("+passwordHash +refreshTokens");

  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized("Invalid credentials");
  }

  const { accessToken } = await establishSession(res, user);
  return ok(res, { user: user.toJSON(), accessToken });
});

export const me = asyncHandler(async (req, res) => {
  return ok(res, { user: req.user.toJSON() });
});

export const completeOnboarding = asyncHandler(async (req, res) => {
  const { technologies, experienceLevel, interests, skills } = req.body;
  const user = req.user;

  user.technologies = technologies;
  user.experienceLevel = experienceLevel;
  user.interests = interests || [];
  // Seed the skills list from chosen technologies if not provided.
  user.skills = Array.isArray(skills) && skills.length ? skills : technologies;
  user.onboarded = true;
  await user.save();

  return ok(res, { user: user.toJSON() });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  if (!token) throw ApiError.unauthorized("No refresh token");

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized("Invalid refresh token");
  }

  const user = await User.findById(payload.sub).select("+refreshTokens");
  const hashed = sha256(token);
  if (!user || !user.refreshTokens.includes(hashed)) {
    throw ApiError.unauthorized("Refresh token revoked");
  }

  // Rotate: drop the used token, issue a fresh pair.
  user.refreshTokens = user.refreshTokens.filter((t) => t !== hashed);
  const { accessToken } = await establishSession(res, user);
  return ok(res, { accessToken });
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token && req.user) {
    const hashed = sha256(token);
    await User.updateOne(
      { _id: req.user._id },
      { $pull: { refreshTokens: hashed } }
    );
  }
  clearAuthCookies(res);
  return ok(res, { message: "Logged out" });
});

/**
 * Password reset — request step. A production build would email a signed,
 * expiring reset link here. We generate the token and (in dev) return it
 * so the flow is testable; we never reveal whether the email exists.
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  const generic = {
    message:
      "If an account exists for that email, a reset link has been sent.",
  };

  if (!user) return ok(res, generic);

  const resetToken = crypto.randomBytes(32).toString("hex");
  // NOTE: persist a hashed+expiring token and email the raw one via your
  // mail provider. Left as a clear integration point.
  const devHint = env.isProd ? {} : { devResetToken: resetToken };
  return ok(res, { ...generic, ...devHint });
});

/* ── OAuth ───────────────────────────────────────────────────── */

/** Redirect the browser to the provider's consent screen. */
export const oauthStart = (provider) =>
  asyncHandler(async (req, res) => {
    const state = crypto.randomBytes(16).toString("hex");
    res.cookie("oauth_state", state, { ...cookieBase, maxAge: 10 * 60 * 1000 });
    const url =
      provider === "github"
        ? getGithubAuthUrl(state)
        : getGoogleAuthUrl(state);
    return res.redirect(url);
  });

/** Handle the provider redirect, upsert the user, then bounce to client. */
export const oauthCallback = (provider) =>
  asyncHandler(async (req, res) => {
    const { code, state } = req.query;
    if (!code) throw ApiError.badRequest("Missing OAuth code");
    if (state && req.cookies?.oauth_state && state !== req.cookies.oauth_state) {
      throw ApiError.badRequest("OAuth state mismatch");
    }

    const p =
      provider === "github"
        ? await exchangeGithubCode(code)
        : await exchangeGoogleCode(code);

    // Find by linked provider id, then by email, else create.
    const providerKey = `oauth.${p.provider}Id`;
    let user =
      (await User.findOne({ [providerKey]: p.providerId })) ||
      (p.email ? await User.findOne({ email: p.email.toLowerCase() }) : null);

    if (!user) {
      user = await User.create({
        fullName: p.fullName || p.username,
        username: await uniqueUsername(p.username || "dev"),
        email: p.email || `${p.username}@users.noreply.devloop.dev`,
        avatar: p.avatar || "",
        bio: p.bio || "",
        isVerified: true,
        oauth: { [`${p.provider}Id`]: p.providerId },
        github:
          p.provider === "github"
            ? { username: p.githubUsername, connected: true }
            : undefined,
      });
    } else {
      user.oauth[`${p.provider}Id`] = p.providerId;
      if (p.provider === "github" && !user.github?.connected) {
        user.github = { username: p.githubUsername, connected: true };
      }
      await user.save();
    }

    await establishSession(res, user);
    const dest = user.onboarded ? "/home" : "/onboarding";
    return res.redirect(`${env.clientUrl}${dest}`);
  });
