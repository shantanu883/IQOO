/* ─────────────────────────────────────────────────────────────
 * DevLoop — client session storage
 * Persists the access token + cached user across reloads.
 * (Real localStorage — this is a standalone Vite app, not a sandbox.)
 * ───────────────────────────────────────────────────────────── */
import type { User } from "@/types";

const TOKEN_KEY = "devloop.token";
const USER_KEY = "devloop.user";

export const session = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setToken(token: string | null) {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage unavailable — ignore */
    }
  },
  getUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  },
  setUser(user: User | null) {
    try {
      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
      else localStorage.removeItem(USER_KEY);
    } catch {
      /* ignore */
    }
  },
  clear() {
    this.setToken(null);
    this.setUser(null);
  },
};
