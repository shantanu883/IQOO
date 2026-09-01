/* ─────────────────────────────────────────────────────────────
 * DevLoop — shared domain types
 * ───────────────────────────────────────────────────────────── */

export type ExperienceLevel = "Beginner" | "Intermediate" | "Advanced";

export type PostType =
  | "code"
  | "project"
  | "question"
  | "tutorial"
  | "achievement"
  | "post";

export type CodeLanguage =
  | "java"
  | "python"
  | "javascript"
  | "typescript"
  | "c"
  | "cpp"
  | "html"
  | "css"
  | "jsx"
  | "sql";

export type CollabRole =
  | "Frontend Developer"
  | "Backend Developer"
  | "UI/UX Designer"
  | "AI/ML Engineer"
  | "Mobile Developer"
  | "DevOps Engineer"
  | "Other";

export type AiAction =
  | "explain"
  | "bugs"
  | "optimize"
  | "improve"
  | "complexity"
  | "document";

export type NotificationType =
  | "follow"
  | "like"
  | "comment"
  | "star"
  | "collab_request"
  | "team_invite"
  | "message"
  | "achievement";

export interface GithubStats {
  username: string;
  connected: boolean;
  publicRepos?: number;
  followers?: number;
  following?: number;
  stars?: number;
  topLanguages?: string[];
  topRepos?: GithubRepo[];
  syncedAt?: string;
}

export interface GithubRepo {
  name: string;
  description?: string;
  url: string;
  stars: number;
  forks: number;
  language?: string;
}

export interface User {
  _id: string;
  fullName: string;
  username: string;
  email?: string;
  avatar: string;
  coverImage?: string;
  bio?: string;
  location?: string;
  college?: string;
  company?: string;
  website?: string;
  linkedin?: string;
  github?: GithubStats;
  skills: string[];
  technologies: string[];
  experienceLevel?: ExperienceLevel;
  interests: string[];
  onboarded?: boolean;
  hackathonAvailable?: boolean;
  isVerified?: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  projectsCount: number;
  starsCount: number;
  createdAt?: string;
  /** Viewer-relative: is the current user following this person? */
  following?: boolean;
}

export interface CodeContent {
  title?: string;
  description?: string;
  language: CodeLanguage;
  code: string;
}

export interface Post {
  _id: string;
  author: User;
  type: PostType;
  caption: string;
  tags: string[];
  code?: CodeContent;
  project?: Project;
  achievement?: { title: string; icon: string };
  media?: { images?: string[]; video?: string };
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  sharesCount: number;
  viewsCount: number;
  liked?: boolean;
  bookmarked?: boolean;
  createdAt: string;
}

export interface Comment {
  _id: string;
  post: string;
  author: User;
  text: string;
  parent?: string | null;
  likesCount: number;
  createdAt: string;
}

export interface Project {
  _id: string;
  name: string;
  slug?: string;
  tagline?: string;
  description?: string;
  coverImage?: string;
  screenshots?: string[];
  demoVideo?: string;
  githubUrl?: string;
  liveUrl?: string;
  techStack: string[];
  category?: string;
  owner: User;
  team?: { user: User; role: string }[];
  collaboration?: { open: boolean; roles: CollabRole[] };
  starsCount: number;
  viewsCount: number;
  commentsCount: number;
  starred?: boolean;
  createdAt?: string;
}

export interface Hackathon {
  _id: string;
  name: string;
  slug?: string;
  organizer: string;
  description?: string;
  coverImage?: string;
  startDate?: string;
  endDate?: string;
  registrationDeadline?: string;
  mode: "Online" | "In-person" | "Hybrid";
  location: string;
  prize?: string;
  technologies: string[];
  teamSize: { min: number; max: number };
  website?: string;
  participantsCount: number;
}

export interface OpenRole {
  role: CollabRole;
  count: number;
  filled: number;
}

export interface HackathonTeam {
  _id: string;
  hackathon: string;
  owner: User;
  projectIdea: string;
  description?: string;
  members: User[];
  skills: string[];
  openRoles: OpenRole[];
  status: "recruiting" | "full" | "closed";
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  recipient: string;
  actor?: User;
  type: NotificationType;
  post?: string;
  project?: string;
  text: string;
  read: boolean;
  createdAt: string;
}

export interface Achievement {
  _id: string;
  user: string;
  key: string;
  title: string;
  icon: string;
  description?: string;
  earnedAt: string;
}

export interface BuildEntry {
  date: string;
  title: string;
  description?: string;
  tags?: string[];
}

export interface BuildStreakData {
  user: string;
  entries: BuildEntry[];
  currentStreak: number;
  longestStreak: number;
  lastEntryDate?: string;
}

export interface MatchResult {
  user: User;
  matchScore: number;
  matchReasons: string[];
}

export interface AiAnalysis {
  action: AiAction;
  label: string;
  result: string;
  mock: boolean;
}

export interface RunResult {
  status: string;
  stdout: string;
  stderr: string;
  time: string | null;
  memory: string | null;
  mock: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface Paginated<T> {
  items: T[];
  pagination: Pagination;
}

export interface SearchResults {
  query: string;
  people: User[];
  posts: Post[];
  projects: Project[];
  hackathons: Hackathon[];
}
