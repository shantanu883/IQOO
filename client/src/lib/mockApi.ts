/* ─────────────────────────────────────────────────────────────
 * DevLoop — in-browser mock API (demo mode)
 * Implements the full DevLoopApi surface over the mock dataset.
 * State (likes, follows, comments, new posts) persists for the
 * session so the UI feels real without any backend.
 * ───────────────────────────────────────────────────────────── */
import type {
  User,
  Post,
  Comment,
  Project,
  NotificationItem,
  BuildStreakData,
  MatchResult,
  AiAnalysis,
  RunResult,
  Paginated,
  SearchResults,
  GithubStats,
} from "@/types";
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
import * as seed from "./mockData";

/* ---------- mutable session state (clones so we never mutate seed) ---------- */
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

let currentUserId: string | null = null;
const usersState: User[] = clone(seed.users);
const postsState: Post[] = clone(seed.posts);
const commentsState: Comment[] = clone(seed.comments);
const projectsState: Project[] = clone(seed.projects);
const notificationsState: NotificationItem[] = clone(seed.notifications);
const buildStreakState: BuildStreakData = clone(seed.buildStreak);

// Follow graph for the demo user (shantanu follows these to start).
const following = new Set<string>(["u_priya", "u_dan", "u_arjun", "u_carlos"]);

const findUser = (id: string) => usersState.find((u) => u._id === id);
const findUserByName = (name: string) =>
  usersState.find((u) => u.username === name);
const me = () => (currentUserId ? findUser(currentUserId) ?? null : null);

/* ---------- helpers ---------- */
const delay = (ms = 260 + Math.random() * 220) =>
  new Promise<void>((r) => setTimeout(r, ms));

function paginate<T>(items: T[], page = 1, limit = 10): Paginated<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  return {
    items: items.slice(start, start + limit),
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: start + limit < total,
    },
  };
}

/** Attach the current viewer's like/bookmark state (already stored on posts here). */
function tokenFor(userId: string) {
  return `demo.${userId}.${Math.random().toString(36).slice(2, 10)}`;
}

/* ---------- deterministic AI mock (mirrors server gemini.service) ---------- */
const AI_LABELS: Record<string, string> = {
  explain: "Explanation",
  bugs: "Potential Bugs",
  optimize: "Optimization Suggestions",
  improve: "Improvement Ideas",
  complexity: "Complexity Analysis",
  document: "Generated Documentation",
};

function estimateComplexity(code: string): string {
  const loops = (code.match(/\b(for|while|forEach|map|reduce|filter)\b/g) || [])
    .length;
  const nested = /for[\s\S]*for|while[\s\S]*while/.test(code);
  if (nested) return "O(n²) — nested iteration detected";
  if (loops >= 1) return "O(n) — single pass over the input";
  return "O(1) — no significant iteration detected";
}

function mockAnalysis(action: string, code: string, language: string): string {
  const lines = code.split("\n").filter((l) => l.trim()).length;
  const fns = (code.match(/\b(function|def|func|=>)\b/g) || []).length;
  switch (action) {
    case "explain":
      return `This ${language} snippet is ~${lines} lines with ${fns} function-like construct(s). It reads its input, performs its core transformation, and returns a result. Each named piece maps to a clear responsibility, and control flow is linear enough to follow top-to-bottom.\n\n(Demo analysis — connect a Gemini API key for a full AI-generated explanation.)`;
    case "bugs":
      return `No obvious crashes on a first read. Things worth double-checking:\n• Edge cases: empty input, null/undefined, and very large values.\n• Error handling: failures look like they propagate rather than being caught.\n• Off-by-one risk anywhere you index or slice.\n\n(Demo analysis — add a Gemini API key for a real bug review.)`;
    case "optimize":
      return `Reasonable as written. Ideas if this is hot:\n• Avoid recomputing values inside loops; hoist them out.\n• Prefer a single pass over multiple chained iterations.\n• Cache/memoize pure results keyed by input.\n\n(Demo analysis — add a Gemini API key for tailored suggestions.)`;
    case "improve":
      return `Solid foundation. To make it more idiomatic ${language}:\n• Give intermediate values descriptive names.\n• Extract the core logic into a small, testable pure function.\n• Add a couple of unit tests around the edge cases.\n\n(Demo analysis — add a Gemini API key for deeper feedback.)`;
    case "complexity":
      return `Estimated time complexity: ${estimateComplexity(code)}.\nSpace is roughly proportional to what you allocate for the result.\n\n(Demo estimate — add a Gemini API key for a rigorous analysis.)`;
    case "document":
      return `/**\n * Summary: describes what this ${language} code does.\n * @remarks Auto-generated stub — replace with specifics.\n * @returns The computed result.\n */\n\n(Demo docs — add a Gemini API key to generate real documentation.)`;
    default:
      return "Demo analysis unavailable for this action.";
  }
}

/* ---------- deterministic code-run mock (mirrors server judge0.service) ---------- */
function simulateRun(code: string, language: string): RunResult {
  const outs: string[] = [];
  const patterns = [
    /print\((?:f?["'`])([^"'`]*)["'`]/g, // python/basic
    /console\.log\((?:["'`])([^"'`]*)["'`]/g, // js/ts
    /System\.out\.println\((?:["'`])([^"'`]*)["'`]/g, // java
    /fmt\.Print(?:ln|f)?\((?:["'`])([^"'`]*)["'`]/g, // go
    /(?:cout\s*<<\s*)(?:["'`])([^"'`]*)["'`]/g, // c++
  ];
  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(code))) outs.push(m[1]);
  }
  const stdout = outs.length
    ? outs.join("\n") + "\n"
    : "(no stdout captured in demo mode)\n";
  return {
    status: "Accepted (simulated)",
    stdout,
    stderr: "",
    time: (0.01 + Math.random() * 0.05).toFixed(3),
    memory: `${1200 + Math.floor(Math.random() * 800)} KB`,
    mock: true,
  };
}

/* ---------- deterministic matching (mirrors server matching.service) ---------- */
function scoreMatch(meU: User, other: User): MatchResult {
  const reasons: string[] = [];
  let score = 0;
  const sharedTech = meU.technologies.filter((t) =>
    other.technologies.includes(t)
  );
  if (sharedTech.length) {
    score += Math.min(45, sharedTech.length * 15);
    reasons.push(`Shares ${sharedTech.slice(0, 3).join(", ")}`);
  }
  const sharedInterests = meU.interests.filter((i) =>
    other.interests.includes(i)
  );
  if (sharedInterests.length) {
    score += Math.min(25, sharedInterests.length * 10);
    reasons.push(`Both into ${sharedInterests.slice(0, 2).join(" & ")}`);
  }
  const levels = ["Beginner", "Intermediate", "Advanced"];
  const gap = Math.abs(
    levels.indexOf(meU.experienceLevel ?? "Intermediate") -
      levels.indexOf(other.experienceLevel ?? "Intermediate")
  );
  score += gap === 0 ? 15 : gap === 1 ? 8 : 3;
  if (gap <= 1) reasons.push("Similar experience level");
  if (meU.hackathonAvailable && other.hackathonAvailable) {
    score += 15;
    reasons.push("Both open to hackathons");
  }
  if (other.isVerified) score += 5;
  if (!reasons.length) reasons.push("New connection to explore");
  return {
    user: other,
    matchScore: Math.min(100, Math.round(score)),
    matchReasons: reasons.slice(0, 3),
  };
}

/* ---------- the mock API ---------- */
export const mockApi: DevLoopApi = {
  /* auth */
  async login(email, password) {
    await delay();
    const user = usersState.find((u) => u.email === email);
    if (!user || password.length < 6) {
      throw new Error("Invalid email or password.");
    }
    currentUserId = user._id;
    return { user: clone(user), accessToken: tokenFor(user._id) } as AuthResult;
  },

  async register(input: RegisterInput) {
    await delay();
    if (usersState.some((u) => u.email === input.email)) {
      throw new Error("An account with that email already exists.");
    }
    if (usersState.some((u) => u.username === input.username)) {
      throw new Error("That username is taken.");
    }
    const user: User = {
      _id: `u_${Date.now()}`,
      fullName: input.fullName,
      username: input.username,
      email: input.email,
      avatar: `https://api.dicebear.com/7.x/glass/svg?seed=${encodeURIComponent(
        input.username
      )}`,
      bio: "",
      skills: [],
      technologies: [],
      interests: [],
      onboarded: false,
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      projectsCount: 0,
      starsCount: 0,
      github: { username: input.username, connected: false },
      createdAt: new Date().toISOString(),
    };
    usersState.push(user);
    currentUserId = user._id;
    return { user: clone(user), accessToken: tokenFor(user._id) };
  },

  async me() {
    await delay(120);
    const u = me();
    return u ? clone(u) : null;
  },

  async completeOnboarding(input: OnboardingInput) {
    await delay();
    const u = me();
    if (!u) throw new Error("Not authenticated.");
    u.technologies = input.technologies;
    u.skills = input.skills?.length ? input.skills : input.technologies;
    u.experienceLevel = input.experienceLevel;
    u.interests = input.interests;
    if (input.bio) u.bio = input.bio;
    u.onboarded = true;
    return clone(u);
  },

  async logout() {
    await delay(80);
    currentUserId = null;
  },

  async oauthUrl(provider) {
    await delay(120);
    // Demo mode can't run a real OAuth handshake; sign in as the demo user.
    return {
      url: `#demo-oauth-${provider}`,
      demo: true,
    };
  },

  async requestPasswordReset(email: string) {
    await delay();
    // Deliberately identical for known and unknown addresses — the real
    // backend behaves the same way so responses can't reveal who has an
    // account. Demo mode has no mail transport, so nothing is actually sent.
    void email;
    return {
      message:
        "If an account exists for that email, a reset link is on its way.",
    };
  },

  /* feed & posts */
  async getFeed(params: FeedParams = {}) {
    await delay();
    const { page = 1, limit = 5, filter = "all" } = params;
    let list = [...postsState];
    if (filter === "following") {
      list = list.filter(
        (p) => following.has(p.author._id) || p.author._id === currentUserId
      );
    } else if (filter && filter !== "all") {
      list = list.filter((p) => p.type === filter);
    }
    list.sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
    );
    return paginate(clone(list), page, limit);
  },

  async getPost(id) {
    await delay(160);
    const post = postsState.find((p) => p._id === id);
    if (!post) throw new Error("Post not found.");
    return clone(post);
  },

  async createPost(input: CreatePostInput) {
    await delay();
    const u = me();
    if (!u) throw new Error("Not authenticated.");
    const post: Post = {
      _id: `post_${Date.now()}`,
      author: clone(u),
      type: input.type,
      caption: input.caption,
      tags: input.tags ?? [],
      code: input.code,
      likesCount: 0,
      commentsCount: 0,
      bookmarksCount: 0,
      sharesCount: 0,
      viewsCount: 0,
      liked: false,
      bookmarked: false,
      createdAt: new Date().toISOString(),
    };
    postsState.unshift(post);
    u.postsCount += 1;
    return clone(post);
  },

  async deletePost(id) {
    await delay();
    const idx = postsState.findIndex((p) => p._id === id);
    if (idx >= 0) {
      if (postsState[idx].author._id === currentUserId) {
        const u = me();
        if (u && u.postsCount > 0) u.postsCount -= 1;
      }
      postsState.splice(idx, 1);
    }
  },

  async toggleLike(id) {
    await delay(140);
    const post = postsState.find((p) => p._id === id);
    if (!post) throw new Error("Post not found.");
    post.liked = !post.liked;
    post.likesCount += post.liked ? 1 : -1;
    return { liked: !!post.liked, likesCount: post.likesCount };
  },

  async toggleBookmark(id) {
    await delay(140);
    const post = postsState.find((p) => p._id === id);
    if (!post) throw new Error("Post not found.");
    post.bookmarked = !post.bookmarked;
    post.bookmarksCount += post.bookmarked ? 1 : -1;
    return { bookmarked: !!post.bookmarked, bookmarksCount: post.bookmarksCount };
  },

  async getBookmarks(page = 1) {
    await delay();
    const list = postsState.filter((p) => p.bookmarked);
    return paginate(clone(list), page, 10);
  },

  async getComments(postId) {
    await delay(160);
    const list = commentsState
      .filter((c) => c.post === postId)
      .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
    return clone(list);
  },

  async addComment(postId, text) {
    await delay(180);
    const u = me();
    if (!u) throw new Error("Not authenticated.");
    const comment: Comment = {
      _id: `c_${Date.now()}`,
      post: postId,
      author: clone(u),
      text,
      likesCount: 0,
      createdAt: new Date().toISOString(),
    };
    commentsState.push(comment);
    const post = postsState.find((p) => p._id === postId);
    if (post) post.commentsCount += 1;
    return clone(comment);
  },

  /* users */
  async getProfile(username) {
    await delay(180);
    const u = findUserByName(username);
    if (!u) throw new Error("User not found.");
    const out = clone(u);
    out.following = following.has(u._id);
    return out;
  },

  async getUserPosts(username, params = {}) {
    await delay();
    const { page = 1, type } = params;
    const u = findUserByName(username);
    if (!u) throw new Error("User not found.");
    let list = postsState.filter((p) => p.author._id === u._id);
    // The profile "Code" tab asks for code posts specifically.
    if (type) list = list.filter((p) => p.type === type);
    list = list.sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
    );
    return paginate(clone(list), page, 10);
  },

  async updateProfile(patch) {
    await delay();
    const u = me();
    if (!u) throw new Error("Not authenticated.");
    Object.assign(u, patch);
    return clone(u);
  },

  async toggleFollow(target) {
    await delay(160);
    const userId = target._id;
    const user = findUser(userId);
    if (!user) throw new Error("User not found.");
    const meU = me();
    const isFollowing = following.has(userId);
    if (isFollowing) {
      following.delete(userId);
      user.followersCount = Math.max(0, user.followersCount - 1);
      if (meU) meU.followingCount = Math.max(0, meU.followingCount - 1);
    } else {
      following.add(userId);
      user.followersCount += 1;
      if (meU) meU.followingCount += 1;
    }
    return { following: !isFollowing, followersCount: user.followersCount };
  },

  async getDevelopers(params = {}) {
    await delay();
    const { page = 1, tech, q } = params;
    let list = usersState.filter((u) => u._id !== currentUserId);
    if (tech) {
      list = list.filter((u) =>
        u.technologies.some((t) => t.toLowerCase() === tech.toLowerCase())
      );
    }
    if (q) {
      const needle = q.toLowerCase();
      list = list.filter(
        (u) =>
          u.fullName.toLowerCase().includes(needle) ||
          u.username.toLowerCase().includes(needle) ||
          (u.bio ?? "").toLowerCase().includes(needle) ||
          u.technologies.some((t) => t.toLowerCase().includes(needle))
      );
    }
    // annotate with follow state via a shallow copy
    const annotated = list.map((u) => {
      const c = clone(u);
      c.following = following.has(u._id);
      return c;
    });
    return paginate(annotated, page, 12);
  },

  async getRecommendations() {
    await delay();
    const meU = me();
    if (!meU) return [];
    return usersState
      .filter((u) => u._id !== meU._id && !following.has(u._id))
      .map((u) => scoreMatch(meU, clone(u)))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);
  },

  async connectGithub(username) {
    await delay(500);
    const u = me();
    if (!u) throw new Error("Not authenticated.");
    // Demo mode: synthesize a plausible-but-clearly-demo profile.
    const stats: GithubStats = {
      username,
      connected: true,
      publicRepos: 20 + (username.length % 30),
      followers: 100 + username.length * 7,
      following: 40 + username.length * 3,
      stars: 300 + username.length * 25,
      topLanguages: ["TypeScript", "JavaScript", "Python"],
      topRepos: [
        {
          name: `${username}-portfolio`,
          description: "Personal site & experiments",
          url: `https://github.com/${username}`,
          stars: 42,
          forks: 6,
          language: "TypeScript",
        },
      ],
      syncedAt: new Date().toISOString(),
    };
    u.github = stats;
    return clone(stats);
  },

  async getGithub(username) {
    await delay(200);
    const u = findUserByName(username);
    if (u?.github?.connected) return clone(u.github);
    return { username, connected: false };
  },

  /* projects */
  async getProjects(params = {}) {
    await delay();
    const { page = 1, category, username, q } = params;
    let list = [...projectsState];
    if (category && category !== "All") {
      list = list.filter((p) => p.category === category);
    }
    if (username) {
      const owner = username.toLowerCase();
      list = list.filter(
        (p) =>
          p.owner.username.toLowerCase() === owner ||
          p.team?.some((m) => m.user.username.toLowerCase() === owner)
      );
    }
    if (q) {
      const needle = q.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(needle) ||
          (p.tagline ?? "").toLowerCase().includes(needle) ||
          p.techStack.some((t) => t.toLowerCase().includes(needle))
      );
    }
    list.sort((a, b) => b.starsCount - a.starsCount);
    return paginate(clone(list), page, 9);
  },

  async getProject(id) {
    await delay(160);
    const p = projectsState.find((x) => x._id === id || x.slug === id);
    if (!p) throw new Error("Project not found.");
    return clone(p);
  },

  async toggleStar(id) {
    await delay(140);
    const p = projectsState.find((x) => x._id === id);
    if (!p) throw new Error("Project not found.");
    p.starred = !p.starred;
    p.starsCount += p.starred ? 1 : -1;
    return { starred: !!p.starred, starsCount: p.starsCount };
  },

  async requestCollaboration(id, _payload) {
    await delay(220);
    const p = projectsState.find((x) => x._id === id);
    if (!p) throw new Error("Project not found.");
    // no-op in demo; the toast in the UI confirms the request
  },

  /* hackathons */
  async getHackathons() {
    await delay();
    return clone(seed.hackathons);
  },

  async getHackathon(id) {
    await delay(160);
    const h = seed.hackathons.find((x) => x._id === id || x.slug === id);
    if (!h) throw new Error("Hackathon not found.");
    return clone(h);
  },

  async getTeams(hackathonId) {
    await delay();
    return clone(
      seed.hackathonTeams.filter((t) => t.hackathon === hackathonId)
    );
  },

  /* notifications */
  async getNotifications() {
    await delay(180);
    const items = clone(
      [...notificationsState].sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
      )
    );
    const unread = notificationsState.filter((n) => !n.read).length;
    return { items, unread } as NotificationFeed;
  },

  async markNotificationRead(id) {
    await delay(80);
    const n = notificationsState.find((x) => x._id === id);
    if (n) n.read = true;
  },

  async markAllNotificationsRead() {
    await delay(120);
    notificationsState.forEach((n) => (n.read = true));
  },

  /* search */
  async search(query) {
    await delay(220);
    const q = query.trim().toLowerCase();
    if (!q) {
      return { query, people: [], posts: [], projects: [], hackathons: [] };
    }
    const people = usersState
      .filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.technologies.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 5);
    const posts = postsState
      .filter(
        (p) =>
          p.caption.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.code?.code.toLowerCase().includes(q)
      )
      .slice(0, 5);
    const projs = projectsState
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.tagline ?? "").toLowerCase().includes(q) ||
          p.techStack.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 5);
    const hacks = seed.hackathons
      .filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.technologies.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 5);
    return {
      query,
      people: clone(people),
      posts: clone(posts),
      projects: clone(projs),
      hackathons: clone(hacks),
    } as SearchResults;
  },

  /* ai + tools */
  async analyzeCode({ action, code, language }) {
    await delay(700);
    return {
      action,
      label: AI_LABELS[action] ?? "Analysis",
      result: mockAnalysis(action, code, language),
      mock: true,
    } as AiAnalysis;
  },

  async assistantChat({ message }) {
    await delay(600);
    const m = message.toLowerCase();
    let reply: string;
    if (m.includes("bug") || m.includes("error") || m.includes("fix")) {
      reply =
        "Start by reproducing it in isolation, then log the inputs right before the failing line. Nine times out of ten it's an unexpected null, an off-by-one, or an async value read before it resolved. Want to paste the snippet and the error?";
    } else if (m.includes("react") || m.includes("component") || m.includes("hook")) {
      reply =
        "For React: keep components small and pure, lift state only as high as it needs to go, and reach for a custom hook the moment logic is reused. If you share the component I can suggest a cleaner structure.";
    } else if (m.includes("learn") || m.includes("start") || m.includes("beginner")) {
      reply =
        "Pick one small project you actually want to exist and build it end to end — that beats tutorials. Ship it, then refactor. Tell me your language and I'll suggest a first project.";
    } else if (m.includes("career") || m.includes("job") || m.includes("interview")) {
      reply =
        "A public portfolio of shipped projects speaks louder than a résumé. For interviews, practice explaining your thinking out loud on medium-difficulty problems rather than grinding hundreds of hard ones.";
    } else {
      reply = `Here's how I'd approach "${message.slice(
        0,
        80
      )}": break it into the smallest working version, get that running, then iterate. Share more detail (language, goal, what you've tried) and I'll get specific.`;
    }
    return {
      reply:
        reply +
        "\n\n_(Demo assistant — connect a Gemini API key for full AI responses.)_",
      mock: true,
    };
  },

  async runCode({ code, language }) {
    await delay(650);
    return simulateRun(code, language);
  },

  /* build streak + achievements */
  async getStreak(username) {
    await delay(200);
    // Only the demo user has a rich streak in the mock dataset.
    if (username && username !== me()?.username) {
      return {
        user: username,
        entries: [],
        currentStreak: 0,
        longestStreak: 0,
      };
    }
    return clone(buildStreakState);
  },

  async logBuild({ title, description, tags }) {
    await delay(220);
    const today = new Date().toISOString().slice(0, 10);
    const existing = buildStreakState.entries.find((e) => e.date === today);
    if (existing) {
      existing.title = title;
      existing.description = description;
      existing.tags = tags;
    } else {
      buildStreakState.entries.push({ date: today, title, description, tags });
      buildStreakState.currentStreak += 1;
      buildStreakState.longestStreak = Math.max(
        buildStreakState.longestStreak,
        buildStreakState.currentStreak
      );
      buildStreakState.lastEntryDate = today;
    }
    return clone(buildStreakState);
  },

  async getAchievements(username) {
    await delay(180);
    if (username && username !== me()?.username) return [];
    return clone(seed.achievements);
  },

  /* misc */
  async getTrendingTech() {
    await delay(120);
    return clone(seed.trendingTech) as TrendingTech[];
  },
};
