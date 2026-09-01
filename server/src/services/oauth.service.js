import axios from "axios";
import { env, features } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * OAuth code-exchange flows for GitHub and Google. These are real
 * implementations — they work the moment valid client credentials are
 * present in the environment. Until then the routes report that the
 * provider is not configured (rather than faking a login).
 */

/** Build the provider consent-screen URL the client redirects to. */
export function getGithubAuthUrl(state) {
  const params = new URLSearchParams({
    client_id: env.github.clientId,
    redirect_uri: env.github.callbackUrl,
    scope: "read:user user:email",
    state,
  });
  return `https://github.com/login/oauth/authorize?${params}`;
}

export function getGoogleAuthUrl(state) {
  const params = new URLSearchParams({
    client_id: env.google.clientId,
    redirect_uri: env.google.callbackUrl,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "consent",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

/** Exchange a GitHub `code` for a normalised profile. */
export async function exchangeGithubCode(code) {
  if (!features.githubOAuth) {
    throw ApiError.serviceUnavailable("GitHub OAuth is not configured");
  }

  const tokenRes = await axios.post(
    "https://github.com/login/oauth/access_token",
    {
      client_id: env.github.clientId,
      client_secret: env.github.clientSecret,
      code,
      redirect_uri: env.github.callbackUrl,
    },
    { headers: { Accept: "application/json" } }
  );

  const accessToken = tokenRes.data.access_token;
  if (!accessToken) throw ApiError.unauthorized("GitHub code exchange failed");

  const authHeader = { Authorization: `Bearer ${accessToken}` };
  const [profile, emails] = await Promise.all([
    axios.get("https://api.github.com/user", { headers: authHeader }),
    axios
      .get("https://api.github.com/user/emails", { headers: authHeader })
      .catch(() => ({ data: [] })),
  ]);

  const primaryEmail =
    emails.data.find((e) => e.primary && e.verified)?.email ||
    profile.data.email;

  return {
    provider: "github",
    providerId: String(profile.data.id),
    email: primaryEmail,
    fullName: profile.data.name || profile.data.login,
    username: profile.data.login,
    avatar: profile.data.avatar_url,
    bio: profile.data.bio || "",
    githubUsername: profile.data.login,
    accessToken,
  };
}

/** Exchange a Google `code` for a normalised profile. */
export async function exchangeGoogleCode(code) {
  if (!features.googleOAuth) {
    throw ApiError.serviceUnavailable("Google OAuth is not configured");
  }

  const tokenRes = await axios.post(
    "https://oauth2.googleapis.com/token",
    new URLSearchParams({
      client_id: env.google.clientId,
      client_secret: env.google.clientSecret,
      code,
      redirect_uri: env.google.callbackUrl,
      grant_type: "authorization_code",
    })
  );

  const accessToken = tokenRes.data.access_token;
  if (!accessToken) throw ApiError.unauthorized("Google code exchange failed");

  const profile = await axios.get(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return {
    provider: "google",
    providerId: String(profile.data.id),
    email: profile.data.email,
    fullName: profile.data.name,
    username: (profile.data.email || "").split("@")[0],
    avatar: profile.data.picture,
    bio: "",
  };
}
