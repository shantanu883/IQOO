/* ─────────────────────────────────────────────────────────────
 * DevLoop — API entry point
 * Demo mode (default) runs entirely in the browser on mock data.
 * Set VITE_DEMO_MODE=false to talk to the real Express backend.
 * ───────────────────────────────────────────────────────────── */
import { DEMO_MODE } from "./apiContract";
import type { DevLoopApi } from "./apiContract";
import { mockApi } from "./mockApi";
import { httpApi } from "./http";

export const api: DevLoopApi = DEMO_MODE ? mockApi : httpApi;

export { DEMO_MODE };
export type { DevLoopApi } from "./apiContract";
export type {
  AuthResult,
  RegisterInput,
  OnboardingInput,
  CreatePostInput,
  FeedParams,
  NotificationFeed,
  TrendingTech,
} from "./apiContract";
