/* ─────────────────────────────────────────────────────────────
 * DevLoop — client-side form validation
 * Mirrors the server's rules so users get instant feedback. The
 * server still validates every request — this is UX, not security.
 * ───────────────────────────────────────────────────────────── */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export function validateEmail(value: string): string | undefined {
  const email = value.trim();
  if (!email) return "Email is required.";
  if (!EMAIL_RE.test(email)) return "Enter a valid email address.";
  return undefined;
}

export function validateFullName(value: string): string | undefined {
  const name = value.trim();
  if (!name) return "Full name is required.";
  if (name.length < 2) return "That name looks too short.";
  if (name.length > 60) return "Keep your name under 60 characters.";
  return undefined;
}

export function validateUsername(value: string): string | undefined {
  const username = value.trim();
  if (!username) return "Username is required.";
  if (username.length < 3) return "At least 3 characters.";
  if (username.length > 20) return "At most 20 characters.";
  if (!USERNAME_RE.test(username))
    return "Use lowercase letters, numbers and underscores only.";
  return undefined;
}

export function validatePassword(value: string): string | undefined {
  if (!value) return "Password is required.";
  if (value.length < 8) return "Use at least 8 characters.";
  if (!/[a-zA-Z]/.test(value) || !/[0-9]/.test(value))
    return "Include at least one letter and one number.";
  return undefined;
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
}

/** Rough strength meter for signup feedback. */
export function passwordStrength(value: string): PasswordStrength {
  if (!value) return { score: 0, label: "" };
  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
  if (/[0-9]/.test(value) && /[^a-zA-Z0-9]/.test(value)) score++;
  const labels = ["Too short", "Weak", "Fair", "Good", "Strong"];
  const clamped = Math.min(score, 4) as PasswordStrength["score"];
  return { score: clamped, label: labels[clamped] };
}

/** Normalise a display name into a suggested username. */
export function suggestUsername(fullName: string): string {
  return fullName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 20);
}
