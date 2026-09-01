/* ─────────────────────────────────────────────────────────────
 * DevLoop — authentication context
 * Wraps the API's auth surface and persists the session.
 * ───────────────────────────────────────────────────────────── */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@/types";
import { api, DEMO_MODE, type RegisterInput, type OnboardingInput } from "@/lib/api";
import { session } from "@/lib/session";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  demoMode: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginDemo: () => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  completeOnboarding: (input: OnboardingInput) => Promise<User>;
  logout: () => Promise<void>;
  /** Patch the in-memory user (e.g. after editing the profile). */
  patchUser: (patch: Partial<User>) => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_EMAIL = "shantanu@devloop.dev";
const DEMO_PASSWORD = "password123";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => session.getUser());
  const [loading, setLoading] = useState(true);

  const persist = useCallback((u: User | null, token?: string) => {
    setUser(u);
    session.setUser(u);
    if (token) session.setToken(token);
  }, []);

  // On mount, validate any cached session against the API.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (session.getToken() || session.getUser()) {
          const me = await api.me();
          if (active) {
            setUser(me);
            session.setUser(me);
          }
        }
      } catch {
        if (active) {
          setUser(null);
          session.clear();
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { user: u, accessToken } = await api.login(email, password);
      persist(u, accessToken);
      return u;
    },
    [persist]
  );

  const loginDemo = useCallback(
    () => login(DEMO_EMAIL, DEMO_PASSWORD),
    [login]
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const { user: u, accessToken } = await api.register(input);
      persist(u, accessToken);
      return u;
    },
    [persist]
  );

  const completeOnboarding = useCallback(
    async (input: OnboardingInput) => {
      const u = await api.completeOnboarding(input);
      persist(u);
      return u;
    },
    [persist]
  );

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
    session.clear();
  }, []);

  const patchUser = useCallback((patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      session.setUser(next);
      return next;
    });
  }, []);

  const refresh = useCallback(async () => {
    const me = await api.me();
    setUser(me);
    session.setUser(me);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      demoMode: DEMO_MODE,
      login,
      loginDemo,
      register,
      completeOnboarding,
      logout,
      patchUser,
      refresh,
    }),
    [user, loading, login, loginDemo, register, completeOnboarding, logout, patchUser, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
