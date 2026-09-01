/* ─────────────────────────────────────────────────────────────
 * DevLoop — in-browser mock dataset (demo mode)
 * A rich, self-contained seed so the app runs with zero backend.
 * Mirrors the server seed personalities but lives in the browser.
 * ───────────────────────────────────────────────────────────── */
import type {
  User,
  Post,
  Project,
  Hackathon,
  HackathonTeam,
  NotificationItem,
  Achievement,
  BuildStreakData,
  Comment,
} from "@/types";

/* ---------- time helpers ---------- */
const DAY = 86_400_000;
const now = Date.now();
export const daysAgo = (n: number) => new Date(now - n * DAY).toISOString();
export const hoursAgo = (n: number) =>
  new Date(now - n * 3_600_000).toISOString();
const ymd = (n: number) =>
  new Date(now - n * DAY).toISOString().slice(0, 10);

const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/glass/svg?seed=${encodeURIComponent(seed)}`;

/* ---------- users ---------- */
export const users: User[] = [
  {
    _id: "u_shantanu",
    fullName: "Shantanu Deshmukh",
    username: "shantanu_dev",
    email: "shantanu@devloop.dev",
    avatar: avatar("shantanu"),
    bio: "Full-stack engineer. I build in public 🛠️  React · Node · TypeScript. Currently shipping DevLoop.",
    location: "Pune, India",
    college: "COEP Technological University",
    company: "Freelance",
    website: "https://shantanu.dev",
    linkedin: "shantanu-deshmukh",
    github: {
      username: "shantanu-dev",
      connected: true,
      publicRepos: 48,
      followers: 512,
      following: 180,
      stars: 1340,
      topLanguages: ["TypeScript", "JavaScript", "Python", "Go"],
      topRepos: [
        {
          name: "devloop",
          description: "Social platform for developers",
          url: "https://github.com/shantanu-dev/devloop",
          stars: 842,
          forks: 96,
          language: "TypeScript",
        },
        {
          name: "react-use-kit",
          description: "A tiny collection of pragmatic React hooks",
          url: "https://github.com/shantanu-dev/react-use-kit",
          stars: 318,
          forks: 41,
          language: "TypeScript",
        },
      ],
      syncedAt: daysAgo(1),
    },
    skills: ["React", "Node.js", "TypeScript", "MongoDB", "Tailwind CSS"],
    technologies: ["React", "Node.js", "TypeScript", "MongoDB", "Express"],
    experienceLevel: "Advanced",
    interests: ["Web Development", "Open Source", "DevTools", "AI"],
    onboarded: true,
    hackathonAvailable: true,
    isVerified: true,
    followersCount: 512,
    followingCount: 180,
    postsCount: 4,
    projectsCount: 2,
    starsCount: 1340,
    createdAt: daysAgo(420),
  },
  {
    _id: "u_arjun",
    fullName: "Arjun Rao",
    username: "arjun_ml",
    email: "arjun@devloop.dev",
    avatar: avatar("arjun"),
    bio: "AI/ML engineer 🤖  Turning research papers into products. PyTorch enjoyer.",
    location: "Bengaluru, India",
    company: "Nexus AI",
    github: {
      username: "arjunrao",
      connected: true,
      publicRepos: 33,
      followers: 890,
      following: 120,
      stars: 2210,
      topLanguages: ["Python", "Jupyter Notebook", "C++"],
      topRepos: [
        {
          name: "tiny-transformer",
          description: "A transformer you can actually read",
          url: "https://github.com/arjunrao/tiny-transformer",
          stars: 1520,
          forks: 210,
          language: "Python",
        },
      ],
      syncedAt: daysAgo(2),
    },
    skills: ["Python", "PyTorch", "TensorFlow", "NLP", "FastAPI"],
    technologies: ["Python", "PyTorch", "TensorFlow", "FastAPI"],
    experienceLevel: "Advanced",
    interests: ["AI", "Machine Learning", "Research", "Open Source"],
    onboarded: true,
    hackathonAvailable: true,
    isVerified: true,
    followersCount: 890,
    followingCount: 120,
    postsCount: 2,
    projectsCount: 1,
    starsCount: 2210,
    createdAt: daysAgo(380),
  },
  {
    _id: "u_priya",
    fullName: "Priya Sharma",
    username: "priya_codes",
    email: "priya@devloop.dev",
    avatar: avatar("priya"),
    bio: "Frontend engineer & design-systems nerd. Accessibility first. she/her",
    location: "Remote",
    company: "Stripe",
    github: {
      username: "priyacodes",
      connected: true,
      publicRepos: 27,
      followers: 430,
      following: 200,
      stars: 760,
      topLanguages: ["TypeScript", "CSS", "JavaScript"],
      topRepos: [
        {
          name: "a11y-primitives",
          description: "Accessible, unstyled UI primitives",
          url: "https://github.com/priyacodes/a11y-primitives",
          stars: 540,
          forks: 62,
          language: "TypeScript",
        },
      ],
      syncedAt: daysAgo(3),
    },
    skills: ["React", "TypeScript", "Tailwind CSS", "Figma", "Accessibility"],
    technologies: ["React", "TypeScript", "Tailwind CSS", "Next.js"],
    experienceLevel: "Advanced",
    interests: ["Web Development", "UI/UX", "Design Systems", "Accessibility"],
    onboarded: true,
    hackathonAvailable: false,
    isVerified: true,
    followersCount: 430,
    followingCount: 200,
    postsCount: 2,
    projectsCount: 1,
    starsCount: 760,
    createdAt: daysAgo(300),
  },
  {
    _id: "u_dan",
    fullName: "Dan Okoro",
    username: "danokoro",
    email: "dan@devloop.dev",
    avatar: avatar("dan"),
    bio: "Backend & platform engineer. I make things fast and hard to break. Go / K8s / Postgres.",
    location: "Lagos, Nigeria",
    company: "Paystack",
    github: {
      username: "danokoro",
      connected: true,
      publicRepos: 41,
      followers: 610,
      following: 90,
      stars: 1180,
      topLanguages: ["Go", "Shell", "Rust"],
      topRepos: [
        {
          name: "ratelimit-go",
          description: "Distributed rate limiting for Go services",
          url: "https://github.com/danokoro/ratelimit-go",
          stars: 720,
          forks: 88,
          language: "Go",
        },
      ],
      syncedAt: daysAgo(1),
    },
    skills: ["Go", "Kubernetes", "PostgreSQL", "Docker", "Redis"],
    technologies: ["Go", "Docker", "Kubernetes", "PostgreSQL"],
    experienceLevel: "Advanced",
    interests: ["Backend", "DevOps", "Distributed Systems", "Open Source"],
    onboarded: true,
    hackathonAvailable: true,
    isVerified: false,
    followersCount: 610,
    followingCount: 90,
    postsCount: 1,
    projectsCount: 1,
    starsCount: 1180,
    createdAt: daysAgo(260),
  },
  {
    _id: "u_mei",
    fullName: "Mei Lin",
    username: "meilin",
    email: "mei@devloop.dev",
    avatar: avatar("mei"),
    bio: "Mobile developer 📱 Flutter & Swift. Pixel-perfect apps and smooth 60fps.",
    location: "Singapore",
    company: "Grab",
    github: {
      username: "meilin",
      connected: false,
    },
    skills: ["Flutter", "Dart", "Swift", "Kotlin", "Firebase"],
    technologies: ["Flutter", "Swift", "Firebase", "Kotlin"],
    experienceLevel: "Intermediate",
    interests: ["Mobile", "UI/UX", "Startups"],
    onboarded: true,
    hackathonAvailable: true,
    isVerified: false,
    followersCount: 240,
    followingCount: 310,
    postsCount: 1,
    projectsCount: 0,
    starsCount: 190,
    createdAt: daysAgo(150),
  },
  {
    _id: "u_carlos",
    fullName: "Carlos Ramirez",
    username: "carlosr",
    email: "carlos@devloop.dev",
    avatar: avatar("carlos"),
    bio: "Indie hacker. Ship small, ship often. Vue + Firebase + Stripe = 💸",
    location: "Mexico City, Mexico",
    company: "Indie",
    skills: ["Vue.js", "JavaScript", "Firebase", "Node.js", "Stripe"],
    technologies: ["Vue.js", "JavaScript", "Firebase", "Node.js"],
    experienceLevel: "Intermediate",
    interests: ["Startups", "Web Development", "SaaS", "Indie Hacking"],
    onboarded: true,
    hackathonAvailable: false,
    isVerified: false,
    followersCount: 180,
    followingCount: 150,
    postsCount: 1,
    projectsCount: 1,
    starsCount: 320,
    createdAt: daysAgo(120),
    github: { username: "carlosr", connected: false },
  },
  {
    _id: "u_sofia",
    fullName: "Sofia Almeida",
    username: "sofia_dev",
    email: "sofia@devloop.dev",
    avatar: avatar("sofia"),
    bio: "Data engineer turning messy data into clean pipelines. Python · SQL · Airflow.",
    location: "Lisbon, Portugal",
    company: "Feedzai",
    skills: ["Python", "SQL", "Airflow", "Spark", "dbt"],
    technologies: ["Python", "SQL", "PostgreSQL", "Docker"],
    experienceLevel: "Intermediate",
    interests: ["Data Engineering", "Backend", "Open Source"],
    onboarded: true,
    hackathonAvailable: true,
    isVerified: false,
    followersCount: 95,
    followingCount: 88,
    postsCount: 0,
    projectsCount: 0,
    starsCount: 140,
    createdAt: daysAgo(80),
    github: { username: "sofia-dev", connected: false },
  },
];

export const byId = (id: string) => users.find((u) => u._id === id)!;
export const byUsername = (u: string) =>
  users.find((x) => x.username === u);

/* Current demo user (also settable at runtime by the mock API). */
export const CURRENT_USER_ID = "u_shantanu";

/* ---------- projects ---------- */
export const projects: Project[] = [
  {
    _id: "p_devloop",
    name: "DevLoop",
    slug: "devloop",
    tagline: "The social network where developers show what they build.",
    description:
      "A full-stack platform combining a code-first feed, GitHub-powered portfolios, AI code analysis, and hackathon team matching. Built with React, Node, and MongoDB.",
    githubUrl: "https://github.com/shantanu-dev/devloop",
    liveUrl: "https://devloop.dev",
    techStack: ["React", "TypeScript", "Node.js", "Express", "MongoDB", "Tailwind CSS"],
    category: "Social",
    owner: byId("u_shantanu"),
    team: [{ user: byId("u_priya"), role: "UI/UX Designer" }],
    collaboration: {
      open: true,
      roles: ["Backend Developer", "AI/ML Engineer"],
    },
    starsCount: 842,
    viewsCount: 5210,
    commentsCount: 34,
    createdAt: daysAgo(30),
  },
  {
    _id: "p_transformer",
    name: "tiny-transformer",
    slug: "tiny-transformer",
    tagline: "A transformer implementation you can actually read.",
    description:
      "A 400-line, heavily-commented transformer in pure PyTorch for teaching. Includes notebooks that visualise attention.",
    githubUrl: "https://github.com/arjunrao/tiny-transformer",
    techStack: ["Python", "PyTorch", "Jupyter"],
    category: "AI/ML",
    owner: byId("u_arjun"),
    collaboration: { open: false, roles: [] },
    starsCount: 1520,
    viewsCount: 8900,
    commentsCount: 71,
    createdAt: daysAgo(60),
  },
  {
    _id: "p_a11y",
    name: "a11y-primitives",
    slug: "a11y-primitives",
    tagline: "Accessible, unstyled UI primitives for React.",
    description:
      "Headless components with correct ARIA, keyboard nav, and focus management baked in. Bring your own styles.",
    githubUrl: "https://github.com/priyacodes/a11y-primitives",
    liveUrl: "https://a11y-primitives.dev",
    techStack: ["React", "TypeScript", "CSS"],
    category: "DevTools",
    owner: byId("u_priya"),
    collaboration: { open: true, roles: ["Frontend Developer"] },
    starsCount: 540,
    viewsCount: 3100,
    commentsCount: 22,
    createdAt: daysAgo(45),
  },
  {
    _id: "p_ratelimit",
    name: "ratelimit-go",
    slug: "ratelimit-go",
    tagline: "Distributed rate limiting for Go services.",
    description:
      "A Redis-backed token-bucket limiter with a clean middleware API for net/http and gRPC. Battle-tested at scale.",
    githubUrl: "https://github.com/danokoro/ratelimit-go",
    techStack: ["Go", "Redis", "Docker"],
    category: "Backend",
    owner: byId("u_dan"),
    collaboration: { open: true, roles: ["Backend Developer", "DevOps Engineer"] },
    starsCount: 720,
    viewsCount: 4200,
    commentsCount: 18,
    createdAt: daysAgo(52),
  },
  {
    _id: "p_payflow",
    name: "PayFlow",
    slug: "payflow",
    tagline: "Stripe-powered subscriptions in a weekend.",
    description:
      "A Vue + Firebase starter that wires up Stripe subscriptions, a customer portal, and webhooks so indie hackers can launch fast.",
    githubUrl: "https://github.com/carlosr/payflow",
    liveUrl: "https://payflow.app",
    techStack: ["Vue.js", "Firebase", "Stripe", "Node.js"],
    category: "SaaS",
    owner: byId("u_carlos"),
    collaboration: { open: false, roles: [] },
    starsCount: 320,
    viewsCount: 2100,
    commentsCount: 12,
    createdAt: daysAgo(20),
  },
];

export const projectById = (id: string) =>
  projects.find((p) => p._id === id);

/* ---------- posts ---------- */
const debouncePost = {
  _id: "post_code_debounce",
  author: byId("u_priya"),
  type: "code" as const,
  caption:
    "TIL you don't need a library for debounce in React. Here's a tiny type-safe hook I keep reaching for 👇",
  tags: ["react", "typescript", "hooks"],
  code: {
    title: "useDebouncedValue.ts",
    description: "A 12-line debounce hook, fully typed.",
    language: "typescript" as const,
    code: `import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}`,
  },
  likesCount: 214,
  commentsCount: 3,
  bookmarksCount: 61,
  sharesCount: 12,
  viewsCount: 1820,
  liked: false,
  bookmarked: false,
  createdAt: hoursAgo(4),
};

export const posts: Post[] = [
  debouncePost,
  {
    _id: "post_project_devloop",
    author: byId("u_shantanu"),
    type: "project",
    caption:
      "Been heads-down for 3 weeks building DevLoop — a place for devs to post what they're actually building, not just hot takes. Feed, code posts, GitHub portfolios, AI review, hackathon matching. Feedback very welcome! 🚀",
    tags: ["react", "nodejs", "mongodb", "buildinpublic"],
    project: projectById("p_devloop"),
    likesCount: 389,
    commentsCount: 2,
    bookmarksCount: 104,
    sharesCount: 40,
    viewsCount: 4100,
    liked: true,
    bookmarked: true,
    createdAt: hoursAgo(9),
  },
  {
    _id: "post_code_python",
    author: byId("u_arjun"),
    type: "code",
    caption:
      "People overcomplicate softmax. Numerically-stable version is basically free — subtract the max before exponentiating. 🧮",
    tags: ["python", "ml", "numpy"],
    code: {
      title: "stable_softmax.py",
      language: "python",
      code: `import numpy as np

def softmax(x: np.ndarray) -> np.ndarray:
    # subtract max for numerical stability
    z = x - np.max(x, axis=-1, keepdims=True)
    e = np.exp(z)
    return e / np.sum(e, axis=-1, keepdims=True)

print(softmax(np.array([2.0, 1.0, 0.1])))`,
    },
    likesCount: 176,
    commentsCount: 1,
    bookmarksCount: 48,
    sharesCount: 9,
    viewsCount: 2400,
    liked: false,
    bookmarked: false,
    createdAt: hoursAgo(20),
  },
  {
    _id: "post_question",
    author: byId("u_mei"),
    type: "question",
    caption:
      "Flutter folks: for a chat app with ~50k daily users, would you reach for Riverpod or Bloc for state management? I keep going back and forth. What held up for you at scale?",
    tags: ["flutter", "dart", "statemanagement"],
    likesCount: 54,
    commentsCount: 2,
    bookmarksCount: 11,
    sharesCount: 3,
    viewsCount: 980,
    liked: false,
    bookmarked: false,
    createdAt: hoursAgo(28),
  },
  {
    _id: "post_tutorial",
    author: byId("u_dan"),
    type: "tutorial",
    caption:
      "Quick one: a token-bucket rate limiter is ~15 lines of Go. Here's the core. Full write-up on distributed limiting with Redis is in ratelimit-go.",
    tags: ["go", "backend", "systemdesign"],
    code: {
      title: "bucket.go",
      description: "In-memory token bucket (single node).",
      language: "c",
      code: `type Bucket struct {
    tokens   float64
    capacity float64
    rate     float64 // tokens per second
    last     time.Time
    mu       sync.Mutex
}

func (b *Bucket) Allow() bool {
    b.mu.Lock()
    defer b.mu.Unlock()
    now := time.Now()
    b.tokens = min(b.capacity, b.tokens+now.Sub(b.last).Seconds()*b.rate)
    b.last = now
    if b.tokens >= 1 {
        b.tokens--
        return true
    }
    return false
}`,
    },
    likesCount: 143,
    commentsCount: 0,
    bookmarksCount: 72,
    sharesCount: 21,
    viewsCount: 1950,
    liked: false,
    bookmarked: true,
    createdAt: daysAgo(2),
  },
  {
    _id: "post_achievement",
    author: byId("u_arjun"),
    type: "achievement",
    caption:
      "tiny-transformer just crossed 1,500 ⭐ on GitHub! Wild to see something I built to teach myself help so many others. Thank you all 🙏",
    tags: ["opensource", "milestone", "pytorch"],
    achievement: { title: "1.5k Stars on tiny-transformer", icon: "star" },
    likesCount: 421,
    commentsCount: 0,
    bookmarksCount: 15,
    sharesCount: 30,
    viewsCount: 3300,
    liked: true,
    bookmarked: false,
    createdAt: daysAgo(3),
  },
  {
    _id: "post_code_shantanu",
    author: byId("u_shantanu"),
    type: "code",
    caption:
      "Clean pattern for API responses that made my frontend code so much calmer — one envelope, every endpoint. 📦",
    tags: ["nodejs", "express", "api"],
    code: {
      title: "response.js",
      language: "javascript",
      code: `export const ok = (res, data, meta = {}, status = 200) =>
  res.status(status).json({ success: true, data, ...meta });

export const created = (res, data, meta = {}) =>
  ok(res, data, meta, 201);

// usage
// return ok(res, posts, { pagination });`,
    },
    likesCount: 98,
    commentsCount: 0,
    bookmarksCount: 33,
    sharesCount: 6,
    viewsCount: 1200,
    liked: false,
    bookmarked: false,
    createdAt: daysAgo(4),
  },
  {
    _id: "post_carlos",
    author: byId("u_carlos"),
    type: "post",
    caption:
      "Reminder to indie hackers: your first version should embarrass you a little. Shipped PayFlow's MVP in a weekend and got my first paying customer 6 days later. Momentum > polish. 💸",
    tags: ["indiehacking", "saas", "startups"],
    likesCount: 267,
    commentsCount: 0,
    bookmarksCount: 44,
    sharesCount: 18,
    viewsCount: 2600,
    liked: false,
    bookmarked: false,
    createdAt: daysAgo(5),
  },
];

/* ---------- comments (keyed by post id) ---------- */
export const comments: Comment[] = [
  {
    _id: "c1",
    post: "post_code_debounce",
    author: byId("u_shantanu"),
    text: "Clean. I usually add a leading-edge option but for search inputs this is perfect.",
    likesCount: 8,
    createdAt: hoursAgo(3),
  },
  {
    _id: "c2",
    post: "post_code_debounce",
    author: byId("u_carlos"),
    text: "Saving this. The generic makes it reusable everywhere 🙌",
    likesCount: 3,
    createdAt: hoursAgo(2),
  },
  {
    _id: "c3",
    post: "post_code_debounce",
    author: byId("u_mei"),
    text: "Does this handle rapid unmounts okay? Cleanup looks right.",
    likesCount: 1,
    createdAt: hoursAgo(1),
  },
  {
    _id: "c4",
    post: "post_project_devloop",
    author: byId("u_priya"),
    text: "The code-first feed is such a good idea. Happy to help polish the design system!",
    likesCount: 14,
    createdAt: hoursAgo(7),
  },
  {
    _id: "c5",
    post: "post_project_devloop",
    author: byId("u_dan"),
    text: "Would love to see the rate-limiting story on the API. Ping me if you want a hand on the backend.",
    likesCount: 9,
    createdAt: hoursAgo(6),
  },
  {
    _id: "c6",
    post: "post_code_python",
    author: byId("u_sofia"),
    text: "The number of prod bugs this one trick prevents… 😅",
    likesCount: 5,
    createdAt: hoursAgo(18),
  },
  {
    _id: "c7",
    post: "post_question",
    author: byId("u_priya"),
    text: "Riverpod aged better for us — compile-time safety and easier testing. Bloc felt heavier than we needed.",
    likesCount: 7,
    createdAt: hoursAgo(24),
  },
  {
    _id: "c8",
    post: "post_question",
    author: byId("u_carlos"),
    text: "Bloc if your team is big and you want strict structure. Otherwise Riverpod.",
    likesCount: 4,
    createdAt: hoursAgo(22),
  },
];

/* ---------- hackathons ---------- */
export const hackathons: Hackathon[] = [
  {
    _id: "h_globalai",
    name: "Global AI Hack 2026",
    slug: "global-ai-hack-2026",
    organizer: "Nexus AI Foundation",
    description:
      "Build something meaningful with modern AI in 48 hours. Tracks: agents, healthcare, and developer tooling. Mentors from leading labs.",
    startDate: daysAgo(-14),
    endDate: daysAgo(-12),
    registrationDeadline: daysAgo(-7),
    mode: "Hybrid",
    location: "Bengaluru + Online",
    prize: "$25,000",
    technologies: ["Python", "PyTorch", "React", "FastAPI"],
    teamSize: { min: 2, max: 4 },
    website: "https://globalaihack.dev",
    participantsCount: 1240,
  },
  {
    _id: "h_web3",
    name: "OpenSource Sprint",
    slug: "opensource-sprint",
    organizer: "DevLoop Community",
    description:
      "A weekend to make your first (or fiftieth) open-source contribution. Maintainers on standby to review PRs live.",
    startDate: daysAgo(-30),
    endDate: daysAgo(-28),
    registrationDeadline: daysAgo(-20),
    mode: "Online",
    location: "Online",
    prize: "Swag + Featured Profile",
    technologies: ["JavaScript", "TypeScript", "Go", "Python"],
    teamSize: { min: 1, max: 3 },
    website: "https://opensourcesprint.dev",
    participantsCount: 860,
  },
  {
    _id: "h_mobile",
    name: "Mobile Makers Jam",
    slug: "mobile-makers-jam",
    organizer: "Grab Engineering",
    description:
      "48 hours to ship a delightful mobile app. Flutter, Swift, and Kotlin all welcome. Judged on craft and UX.",
    startDate: daysAgo(-45),
    endDate: daysAgo(-43),
    registrationDeadline: daysAgo(-35),
    mode: "In-person",
    location: "Singapore",
    prize: "$10,000",
    technologies: ["Flutter", "Swift", "Kotlin", "Firebase"],
    teamSize: { min: 2, max: 5 },
    website: "https://mobilemakersjam.dev",
    participantsCount: 420,
  },
];

export const hackathonById = (id: string) =>
  hackathons.find((h) => h._id === id);

/* ---------- hackathon teams ---------- */
export const hackathonTeams: HackathonTeam[] = [
  {
    _id: "t_ai_agents",
    hackathon: "h_globalai",
    owner: byId("u_arjun"),
    projectIdea: "An AI agent that reviews pull requests and explains risky changes.",
    description:
      "Looking for a frontend dev to build the dashboard and someone strong on backend/infra. I'll handle the model + agent orchestration.",
    members: [byId("u_arjun")],
    skills: ["Python", "PyTorch", "FastAPI"],
    openRoles: [
      { role: "Frontend Developer", count: 1, filled: 0 },
      { role: "Backend Developer", count: 1, filled: 0 },
    ],
    status: "recruiting",
    createdAt: daysAgo(6),
  },
  {
    _id: "t_devtools",
    hackathon: "h_web3",
    owner: byId("u_dan"),
    projectIdea: "A CLI that auto-generates OpenAPI docs from Go handlers.",
    description:
      "Backend is mostly there. Need a designer for the docs site and someone who loves DX writing.",
    members: [byId("u_dan"), byId("u_sofia")],
    skills: ["Go", "OpenAPI", "CLI"],
    openRoles: [{ role: "UI/UX Designer", count: 1, filled: 0 }],
    status: "recruiting",
    createdAt: daysAgo(9),
  },
];

/* ---------- notifications (for current user) ---------- */
export const notifications: NotificationItem[] = [
  {
    _id: "n1",
    recipient: CURRENT_USER_ID,
    actor: byId("u_priya"),
    type: "comment",
    post: "post_project_devloop",
    text: "commented on your project DevLoop",
    read: false,
    createdAt: hoursAgo(7),
  },
  {
    _id: "n2",
    recipient: CURRENT_USER_ID,
    actor: byId("u_dan"),
    type: "collab_request",
    project: "p_devloop",
    text: "wants to collaborate on DevLoop as a Backend Developer",
    read: false,
    createdAt: hoursAgo(6),
  },
  {
    _id: "n3",
    recipient: CURRENT_USER_ID,
    actor: byId("u_arjun"),
    type: "follow",
    text: "started following you",
    read: false,
    createdAt: hoursAgo(11),
  },
  {
    _id: "n4",
    recipient: CURRENT_USER_ID,
    actor: byId("u_carlos"),
    type: "like",
    post: "post_code_shantanu",
    text: "liked your code post",
    read: true,
    createdAt: daysAgo(1),
  },
  {
    _id: "n5",
    recipient: CURRENT_USER_ID,
    actor: byId("u_mei"),
    type: "star",
    project: "p_devloop",
    text: "starred your project DevLoop",
    read: true,
    createdAt: daysAgo(2),
  },
];

/* ---------- achievements (for current user) ---------- */
export const achievements: Achievement[] = [
  {
    _id: "a1",
    user: CURRENT_USER_ID,
    key: "first_post",
    title: "First Commit",
    icon: "rocket",
    description: "Published your first post on DevLoop.",
    earnedAt: daysAgo(30),
  },
  {
    _id: "a2",
    user: CURRENT_USER_ID,
    key: "streak_7",
    title: "7-Day Streak",
    icon: "flame",
    description: "Logged a build seven days in a row.",
    earnedAt: daysAgo(10),
  },
  {
    _id: "a3",
    user: CURRENT_USER_ID,
    key: "stars_1k",
    title: "1k Stars Club",
    icon: "star",
    description: "Your projects crossed 1,000 combined stars.",
    earnedAt: daysAgo(15),
  },
  {
    _id: "a4",
    user: CURRENT_USER_ID,
    key: "collaborator",
    title: "Team Player",
    icon: "users",
    description: "Collaborated on someone else's project.",
    earnedAt: daysAgo(22),
  },
];

/* ---------- build streak (for current user) ---------- */
const buildEntryTitles = [
  "Shipped the home feed with infinite scroll",
  "Wrote the deterministic matching algorithm",
  "Added JWT refresh-token rotation",
  "Built the code post syntax highlighter",
  "Wired up the AI analysis panel",
  "Refactored the API response envelope",
  "Set up the seed data + demo mode",
  "Designed the 3-column responsive layout",
  "Added the build-streak heatmap",
  "Polished the onboarding flow",
];

function buildStreakEntries(): BuildStreakData {
  const entries = [];
  // Active over the last ~40 days with a strong recent streak.
  const activeDays = new Set<number>();
  for (let i = 0; i < 12; i++) activeDays.add(i); // last 12 days: current streak
  [14, 15, 16, 18, 20, 21, 25, 26, 30, 33, 38].forEach((d) => activeDays.add(d));

  const sorted = [...activeDays].sort((a, b) => a - b);
  sorted.forEach((d, idx) => {
    entries.push({
      date: ymd(d),
      title: buildEntryTitles[idx % buildEntryTitles.length],
      tags: ["devloop"],
    });
  });

  return {
    user: CURRENT_USER_ID,
    entries,
    currentStreak: 12,
    longestStreak: 12,
    lastEntryDate: ymd(0),
  };
}

export const buildStreak: BuildStreakData = buildStreakEntries();

/* Trending technologies for the right sidebar. */
export const trendingTech = [
  { name: "TypeScript", posts: 1284 },
  { name: "React", posts: 1102 },
  { name: "Python", posts: 968 },
  { name: "Rust", posts: 741 },
  { name: "Go", posts: 512 },
  { name: "Next.js", posts: 489 },
];
