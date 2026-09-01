/* ─────────────────────────────────────────────────────────────
 * DevLoop — real backend API client (live mode)
 * Implements DevLoopApi over the Express backend using axios.
 * Response envelope from the server is { success, data, ...meta }.
 * ───────────────────────────────────────────────────────────── */
import axios, { type AxiosInstance } from "axios";
import type {
  DevLoopApi,
  AuthResult,
  RegisterInput,
  OnboardingInput,
  CreatePostInput,
  FeedParams,
  NotificationFeed,
  TrendingTech,
} from "./apiContract";
import { session } from "./session";
import type { Paginated } from "@/types";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Attach bearer token.
client.interceptors.request.use((config) => {
  const token = session.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Single-flight refresh on 401.
let refreshing: Promise<string | null> | null = null;

async function refreshToken(): Promise<string | null> {
  try {
    const res = await axios.post(
      `${BASE_URL}/auth/refresh`,
      {},
      { withCredentials: true }
    );
    const token: string | undefined = res.data?.data?.accessToken;
    if (token) {
      session.setToken(token);
      return token;
    }
  } catch {
    /* fall through */
  }
  return null;
}

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (
      error.response?.status === 401 &&
      original &&
      !original._retried &&
      !String(original.url).includes("/auth/")
    ) {
      original._retried = true;
      refreshing = refreshing ?? refreshToken();
      const token = await refreshing;
      refreshing = null;
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return client(original);
      }
      session.clear();
    }
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Request failed.";
    return Promise.reject(new Error(message));
  }
);

/** Unwrap the { success, data, ...meta } envelope. */
const data = <T>(res: { data: { data: T } }): T => res.data.data;

/** Some list endpoints return { items, pagination }; normalize. */
function asPaginated<T>(payload: any, page = 1): Paginated<T> {
  if (payload && Array.isArray(payload.items)) return payload as Paginated<T>;
  const items = Array.isArray(payload) ? payload : [];
  return {
    items,
    pagination: {
      page,
      limit: items.length,
      total: items.length,
      totalPages: 1,
      hasMore: false,
    },
  };
}

const FALLBACK_TRENDING: TrendingTech[] = [
  { name: "TypeScript", posts: 1284 },
  { name: "React", posts: 1102 },
  { name: "Python", posts: 968 },
  { name: "Rust", posts: 741 },
  { name: "Go", posts: 512 },
];

export const httpApi: DevLoopApi = {
  /* auth */
  async login(email, password) {
    const res = await client.post("/auth/login", { email, password });
    return data<AuthResult>(res);
  },
  async register(input: RegisterInput) {
    const res = await client.post("/auth/register", input);
    return data<AuthResult>(res);
  },
  async me() {
    try {
      const res = await client.get("/auth/me");
      return data(res);
    } catch {
      return null;
    }
  },
  async completeOnboarding(input: OnboardingInput) {
    const res = await client.post("/auth/onboarding", input);
    return data(res);
  },
  async logout() {
    try {
      await client.post("/auth/logout");
    } catch {
      /* ignore */
    }
  },
  async oauthUrl(provider) {
    // Server route redirects to the provider; the SPA just navigates there.
    return { url: `${BASE_URL}/auth/${provider}`, demo: false };
  },

  async requestPasswordReset(email) {
    const res = await client.post("/auth/forgot-password", { email });
    const payload = data<{ message?: string }>(res);
    return {
      message:
        payload?.message ??
        "If an account exists for that email, a reset link is on its way.",
    };
  },

  /* feed & posts */
  async getFeed(params: FeedParams = {}) {
    const { page = 1, limit = 5, filter } = params;
    const query: Record<string, unknown> = { page, limit };
    if (filter && filter !== "all" && filter !== "following") query.type = filter;
    if (filter === "following") query.following = true;
    const res = await client.get("/posts", { params: query });
    return asPaginated(data(res), page);
  },
  async getPost(id) {
    return data(await client.get(`/posts/${id}`));
  },
  async createPost(input: CreatePostInput) {
    return data(await client.post("/posts", input));
  },
  async deletePost(id) {
    await client.delete(`/posts/${id}`);
  },
  async toggleLike(id) {
    return data(await client.post(`/posts/${id}/like`));
  },
  async toggleBookmark(id) {
    return data(await client.post(`/posts/${id}/bookmark`));
  },
  async getBookmarks(page = 1) {
    const res = await client.get("/posts/bookmarks/me", { params: { page } });
    return asPaginated(data(res), page);
  },
  async getComments(postId) {
    const payload: any = data(await client.get(`/posts/${postId}/comments`));
    return Array.isArray(payload) ? payload : payload.items ?? [];
  },
  async addComment(postId, text) {
    return data(await client.post(`/posts/${postId}/comments`, { text }));
  },

  /* users */
  async getProfile(username) {
    return data(await client.get(`/users/${username}`));
  },
  async getUserPosts(username, params = {}) {
    const page = params.page ?? 1;
    const res = await client.get(`/users/${username}/posts`, {
      params: { page, type: params.type },
    });
    return asPaginated(data(res), page);
  },
  async updateProfile(patch) {
    return data(await client.patch("/users/me", patch));
  },
  async toggleFollow(target) {
    return data(await client.post(`/users/${target.username}/follow`));
  },
  async getDevelopers(params = {}) {
    const res = await client.get("/users", { params });
    return asPaginated(data(res), params.page ?? 1);
  },
  async getRecommendations() {
    const payload: any = data(await client.get("/users/recommendations"));
    return Array.isArray(payload) ? payload : payload.items ?? [];
  },
  async connectGithub(username) {
    return data(await client.post("/users/me/github", { username }));
  },
  async getGithub(username) {
    return data(await client.get(`/users/${username}/github`));
  },

  /* projects */
  async getProjects(params = {}) {
    const res = await client.get("/projects", { params });
    return asPaginated(data(res), params.page ?? 1);
  },
  async getProject(id) {
    return data(await client.get(`/projects/${id}`));
  },
  async toggleStar(id) {
    return data(await client.post(`/projects/${id}/star`));
  },
  async requestCollaboration(id, payload) {
    await client.post(`/projects/${id}/collaborate`, payload);
  },

  /* hackathons */
  async getHackathons() {
    const payload: any = data(await client.get("/hackathons"));
    return Array.isArray(payload) ? payload : payload.items ?? [];
  },
  async getHackathon(id) {
    return data(await client.get(`/hackathons/${id}`));
  },
  async getTeams(hackathonId) {
    const payload: any = data(await client.get(`/hackathons/${hackathonId}/teams`));
    return Array.isArray(payload) ? payload : payload.items ?? [];
  },

  /* notifications */
  async getNotifications() {
    const payload: any = data(await client.get("/notifications"));
    const items = Array.isArray(payload) ? payload : payload.items ?? [];
    const unread =
      payload.unread ?? items.filter((n: any) => !n.read).length;
    return { items, unread } as NotificationFeed;
  },
  async markNotificationRead(id) {
    await client.patch(`/notifications/${id}/read`);
  },
  async markAllNotificationsRead() {
    await client.patch("/notifications/read-all");
  },

  /* search */
  async search(query) {
    return data(await client.get("/search", { params: { q: query } }));
  },

  /* ai + tools */
  async analyzeCode(input) {
    return data(await client.post("/ai/analyze", input));
  },
  async assistantChat(input) {
    return data(await client.post("/ai/chat", input));
  },
  async runCode(input) {
    return data(await client.post("/code/run", input));
  },

  /* build streak + achievements */
  async getStreak(username) {
    const u = username ?? session.getUser()?.username;
    return data(await client.get(`/streaks/${u}`));
  },
  async logBuild(input) {
    return data(await client.post("/streaks", input));
  },
  async getAchievements() {
    // No dedicated endpoint in the MVP backend; profile carries badges when live.
    return [];
  },

  /* misc */
  async getTrendingTech() {
    return FALLBACK_TRENDING;
  },
};
