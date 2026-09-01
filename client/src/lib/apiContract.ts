/* ─────────────────────────────────────────────────────────────
 * DevLoop — API contract
 * A single typed surface implemented twice: once against the
 * in-browser mock (demo mode) and once against the real backend.
 * Swapping between them is a one-line change in api.ts.
 * ───────────────────────────────────────────────────────────── */
import type {
  User,
  Post,
  Comment,
  Project,
  Hackathon,
  HackathonTeam,
  NotificationItem,
  Achievement,
  BuildStreakData,
  MatchResult,
  AiAnalysis,
  RunResult,
  Paginated,
  SearchResults,
  PostType,
  CodeContent,
  AiAction,
  CodeLanguage,
  ExperienceLevel,
  CollabRole,
  GithubStats,
} from "@/types";

/** Demo mode runs entirely in the browser on the mock dataset. */
export const DEMO_MODE =
  (import.meta.env.VITE_DEMO_MODE ?? "true") !== "false";

export interface AuthResult {
  user: User;
  accessToken: string;
}

export interface RegisterInput {
  fullName: string;
  username: string;
  email: string;
  password: string;
}

export interface OnboardingInput {
  technologies: string[];
  experienceLevel: ExperienceLevel;
  interests: string[];
  bio?: string;
  skills?: string[];
}

export interface CreatePostInput {
  type: PostType;
  caption: string;
  tags?: string[];
  code?: CodeContent;
}

export interface FeedParams {
  page?: number;
  limit?: number;
  filter?: PostType | "all" | "following";
}

export interface TrendingTech {
  name: string;
  posts: number;
}

export interface NotificationFeed {
  items: NotificationItem[];
  unread: number;
}

export interface DevLoopApi {
  /* auth */
  login(email: string, password: string): Promise<AuthResult>;
  register(input: RegisterInput): Promise<AuthResult>;
  me(): Promise<User | null>;
  completeOnboarding(input: OnboardingInput): Promise<User>;
  logout(): Promise<void>;
  oauthUrl(provider: "github" | "google"): Promise<{ url: string; demo: boolean }>;
  /**
   * Starts a password reset. Always resolves for existing *and* unknown
   * emails so the response can't be used to enumerate accounts.
   */
  requestPasswordReset(email: string): Promise<{ message: string }>;

  /* feed & posts */
  getFeed(params?: FeedParams): Promise<Paginated<Post>>;
  getPost(id: string): Promise<Post>;
  createPost(input: CreatePostInput): Promise<Post>;
  deletePost(id: string): Promise<void>;
  toggleLike(id: string): Promise<{ liked: boolean; likesCount: number }>;
  toggleBookmark(
    id: string
  ): Promise<{ bookmarked: boolean; bookmarksCount: number }>;
  getBookmarks(page?: number): Promise<Paginated<Post>>;
  getComments(postId: string): Promise<Comment[]>;
  addComment(postId: string, text: string): Promise<Comment>;

  /* users */
  getProfile(username: string): Promise<User>;
  getUserPosts(
    username: string,
    params?: { page?: number; type?: PostType }
  ): Promise<Paginated<Post>>;
  updateProfile(patch: Partial<User>): Promise<User>;
  toggleFollow(
    target: Pick<User, "_id" | "username">
  ): Promise<{ following: boolean; followersCount: number }>;
  getDevelopers(params?: {
    page?: number;
    tech?: string;
    q?: string;
  }): Promise<Paginated<User>>;
  getRecommendations(): Promise<MatchResult[]>;
  connectGithub(username: string): Promise<GithubStats>;
  getGithub(username: string): Promise<GithubStats>;

  /* projects */
  getProjects(params?: {
    page?: number;
    category?: string;
    /** Restrict to projects owned by this username (profile tab). */
    username?: string;
    q?: string;
  }): Promise<Paginated<Project>>;
  getProject(id: string): Promise<Project>;
  toggleStar(id: string): Promise<{ starred: boolean; starsCount: number }>;
  requestCollaboration(
    id: string,
    payload: { role: CollabRole; message?: string }
  ): Promise<void>;

  /* hackathons */
  getHackathons(): Promise<Hackathon[]>;
  getHackathon(id: string): Promise<Hackathon>;
  getTeams(hackathonId: string): Promise<HackathonTeam[]>;

  /* notifications */
  getNotifications(): Promise<NotificationFeed>;
  markNotificationRead(id: string): Promise<void>;
  markAllNotificationsRead(): Promise<void>;

  /* search */
  search(query: string): Promise<SearchResults>;

  /* ai + tools */
  analyzeCode(input: {
    action: AiAction;
    code: string;
    language: CodeLanguage;
  }): Promise<AiAnalysis>;
  assistantChat(input: {
    message: string;
    history?: { role: "user" | "assistant"; content: string }[];
  }): Promise<{ reply: string; mock: boolean }>;
  runCode(input: {
    code: string;
    language: CodeLanguage;
    stdin?: string;
  }): Promise<RunResult>;

  /* build streak + achievements */
  getStreak(username?: string): Promise<BuildStreakData>;
  logBuild(input: {
    title: string;
    description?: string;
    tags?: string[];
  }): Promise<BuildStreakData>;
  getAchievements(username?: string): Promise<Achievement[]>;

  /* misc */
  getTrendingTech(): Promise<TrendingTech[]>;
}
