import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

/**
 * Access/refresh token helpers. Access tokens are short-lived and sent
 * as a Bearer header (or httpOnly cookie); refresh tokens are long-lived,
 * stored hashed on the user, and rotated on use.
 */
export function signAccessToken(user) {
  return jwt.sign(
    { sub: String(user._id), username: user.username, roles: user.roles },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessExpires }
  );
}

export function signRefreshToken(user) {
  return jwt.sign({ sub: String(user._id) }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpires,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.accessSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwt.refreshSecret);
}

export function issueTokens(user) {
  return {
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user),
  };
}
