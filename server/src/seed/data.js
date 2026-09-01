/**
 * Realistic demo content for `npm run seed`. Developer-flavoured, no
 * lorem ipsum. Users are created first; the build* helpers then wire
 * posts/projects to those users by username.
 *
 * All demo accounts share the password:  password123
 */

const avatar = (seed) =>
  `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(seed)}`;

export const developers = [
  {
    fullName: "Shantanu Verma",
    username: "shantanu_dev",
    email: "shantanu@devloop.dev",
    passwordHash: "password123",
    avatar: avatar("shantanu"),
    bio: "Full-stack dev building in public. React + Node. Coffee → code → repeat.",
    location: "Bengaluru, India",
    college: "IIT Bombay",
    website: "https://shantanu.dev",
    linkedin: "https://linkedin.com/in/shantanu",
    github: { username: "shantanu", connected: true, publicRepos: 48, followers: 320, stars: 1240, topLanguages: ["TypeScript", "JavaScript", "Python"] },
    skills: ["React", "Node.js", "TypeScript", "MongoDB", "Docker"],
    technologies: ["React", "Node.js", "TypeScript", "JavaScript"],
    experienceLevel: "Advanced",
    interests: ["Web Development", "Open Source", "Hackathons"],
    onboarded: true,
    hackathonAvailable: true,
    isVerified: true,
  },
  {
    fullName: "Arjun Mehta",
    username: "arjun_ml",
    email: "arjun@devloop.dev",
    passwordHash: "password123",
    avatar: avatar("arjun"),
    bio: "ML engineer. TensorFlow & PyTorch. Turning data into products.",
    location: "Pune, India",
    company: "Fractal AI",
    github: { username: "arjunml", connected: true, publicRepos: 31, followers: 210, stars: 640, topLanguages: ["Python", "Jupyter Notebook"] },
    skills: ["Python", "TensorFlow", "PyTorch", "Pandas", "FastAPI"],
    technologies: ["Python", "Machine Learning", "AI", "Data Science"],
    experienceLevel: "Advanced",
    interests: ["AI/ML", "Hackathons", "Data Science"],
    onboarded: true,
    hackathonAvailable: true,
    isVerified: true,
  },
  {
    fullName: "Priya Nair",
    username: "priya_codes",
    email: "priya@devloop.dev",
    passwordHash: "password123",
    avatar: avatar("priya"),
    bio: "Frontend engineer & UI enthusiast. Design systems, accessibility, delightful UX.",
    location: "Kochi, India",
    college: "NIT Calicut",
    skills: ["React", "TypeScript", "Tailwind", "Figma", "Next.js"],
    technologies: ["React", "TypeScript", "JavaScript"],
    experienceLevel: "Intermediate",
    interests: ["Web Development", "Open Source"],
    onboarded: true,
    hackathonAvailable: true,
  },
  {
    fullName: "Daniel Okoro",
    username: "danokoro",
    email: "daniel@devloop.dev",
    passwordHash: "password123",
    avatar: avatar("daniel"),
    bio: "Backend & DevOps. Go, Kubernetes, and making things scale.",
    location: "Lagos, Nigeria",
    company: "Paystack",
    skills: ["Go", "Kubernetes", "AWS", "PostgreSQL", "Terraform"],
    technologies: ["Cloud", "DevOps", "C++"],
    experienceLevel: "Advanced",
    interests: ["Cloud", "Open Source", "Cybersecurity"],
    onboarded: true,
  },
  {
    fullName: "Mei Lin",
    username: "meilin",
    email: "mei@devloop.dev",
    passwordHash: "password123",
    avatar: avatar("mei"),
    bio: "CS student. Learning in public — Android, Flutter, and a bit of everything.",
    location: "Singapore",
    college: "NUS",
    skills: ["Flutter", "Dart", "Kotlin", "Firebase"],
    technologies: ["Flutter", "Android", "JavaScript"],
    experienceLevel: "Beginner",
    interests: ["Mobile Development", "Hackathons"],
    onboarded: true,
    hackathonAvailable: true,
  },
  {
    fullName: "Carlos Ramirez",
    username: "carlosr",
    email: "carlos@devloop.dev",
    passwordHash: "password123",
    avatar: avatar("carlos"),
    bio: "Security researcher & CTF player. Breaking things so you don't have to.",
    location: "Madrid, Spain",
    skills: ["Python", "C", "Rust", "Reverse Engineering"],
    technologies: ["Cybersecurity", "Python", "C"],
    experienceLevel: "Advanced",
    interests: ["Cybersecurity", "Competitive Programming"],
    onboarded: true,
  },
];

export function buildPosts(byUser) {
  return [
    {
      author: byUser.shantanu_dev,
      type: "achievement",
      caption: "🚀 Built my first full-stack React dashboard today. Shipped it end-to-end!",
      tags: ["React", "WebDevelopment", "BuildInPublic"],
      achievement: { title: "First Project Shipped", icon: "🚀" },
      likesCount: 324,
      commentsCount: 42,
      viewsCount: 5120,
    },
    {
      author: byUser.arjun_ml,
      type: "code",
      caption: "Clean way to memoize an expensive function in Python 🐍",
      tags: ["Python", "Performance"],
      code: {
        title: "LRU-cached Fibonacci",
        description: "functools.lru_cache turns exponential recursion into linear time.",
        language: "python",
        code: `from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n: int) -> int:
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

print([fib(i) for i in range(10)])`,
      },
      likesCount: 198,
      commentsCount: 17,
      viewsCount: 2830,
    },
    {
      author: byUser.priya_codes,
      type: "code",
      caption: "A tiny React hook I reach for on every project — debounced value.",
      tags: ["React", "TypeScript", "Hooks"],
      code: {
        title: "useDebounce",
        description: "Delays updating a value until the user stops typing.",
        language: "typescript",
        code: `import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}`,
      },
      likesCount: 276,
      commentsCount: 29,
      viewsCount: 4010,
    },
    {
      author: byUser.danokoro,
      type: "question",
      caption:
        "What's your go-to strategy for zero-downtime DB migrations on Postgres at scale? Expand-contract vs. blue-green?",
      tags: ["PostgreSQL", "DevOps", "Scaling"],
      likesCount: 87,
      commentsCount: 54,
      viewsCount: 1920,
    },
    {
      author: byUser.meilin,
      type: "tutorial",
      caption:
        "How I set up Firebase Auth in a Flutter app in under 10 minutes 🔥 (thread in comments)",
      tags: ["Flutter", "Firebase", "Mobile"],
      likesCount: 143,
      commentsCount: 22,
      viewsCount: 2600,
    },
    {
      author: byUser.carlosr,
      type: "post",
      caption:
        "Reminder: never trust user input. Spent all day on a SSRF that started with an innocent-looking URL param. Validate everything. 🔐",
      tags: ["Cybersecurity", "WebSecurity"],
      likesCount: 402,
      commentsCount: 61,
      viewsCount: 7300,
    },
    {
      author: byUser.shantanu_dev,
      type: "code",
      caption: "Debounce in vanilla JS — no libraries needed.",
      tags: ["JavaScript", "Snippet"],
      code: {
        title: "debounce()",
        description: "Higher-order function that limits how often fn runs.",
        language: "javascript",
        code: `function debounce(fn, wait = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}`,
      },
      likesCount: 156,
      commentsCount: 12,
      viewsCount: 2210,
    },
  ];
}

export function buildProjects(byUser) {
  return [
    {
      name: "DevBoard",
      slug: "devboard",
      tagline: "A real-time analytics dashboard for indie developers.",
      description:
        "DevBoard aggregates your GitHub, npm and Vercel stats into one clean, real-time dashboard. Built to help solo devs track what matters without spreadsheets.",
      coverImage: "",
      githubUrl: "https://github.com/shantanu/devboard",
      liveUrl: "https://devboard.demo.dev",
      techStack: ["React", "Node.js", "MongoDB", "Socket.IO", "Tailwind"],
      category: "Web",
      owner: byUser.shantanu_dev,
      team: [{ user: byUser.shantanu_dev, role: "Owner" }],
      collaboration: { open: true, roles: ["UI/UX Designer", "Backend Developer"] },
      starsCount: 128,
      viewsCount: 3400,
    },
    {
      name: "LeafLens",
      slug: "leaflens",
      tagline: "On-device plant disease detection for farmers.",
      description:
        "A TensorFlow Lite model that identifies crop diseases from a phone photo — fully offline. Trained on 40k labelled leaf images.",
      techStack: ["Python", "TensorFlow", "Flutter", "FastAPI"],
      category: "AI/ML",
      owner: byUser.arjun_ml,
      team: [
        { user: byUser.arjun_ml, role: "Owner" },
        { user: byUser.meilin, role: "Mobile Developer" },
      ],
      collaboration: { open: true, roles: ["Mobile Developer"] },
      starsCount: 94,
      viewsCount: 2100,
    },
    {
      name: "Aegis",
      slug: "aegis",
      tagline: "Open-source secrets scanner for CI pipelines.",
      description:
        "Aegis scans commits and PRs for leaked API keys and credentials before they hit your history. Pluggable rules, GitHub Action included.",
      techStack: ["Go", "Docker", "GitHub Actions"],
      category: "DevOps",
      owner: byUser.danokoro,
      team: [{ user: byUser.danokoro, role: "Owner" }],
      collaboration: { open: false, roles: [] },
      starsCount: 211,
      viewsCount: 5600,
    },
    {
      name: "Pixel",
      slug: "pixel",
      tagline: "An accessible, themeable React component library.",
      description:
        "40+ WCAG-compliant components with dark mode, keyboard nav, and zero-runtime styling. Docs-first, TypeScript-native.",
      techStack: ["React", "TypeScript", "Tailwind", "Storybook"],
      category: "Web",
      owner: byUser.priya_codes,
      team: [{ user: byUser.priya_codes, role: "Owner" }],
      collaboration: { open: true, roles: ["Frontend Developer"] },
      starsCount: 167,
      viewsCount: 4300,
    },
  ];
}

export const hackathons = [
  {
    name: "HackTheGlobe 2026",
    slug: "hacktheglobe-2026",
    organizer: "Major League Hacking",
    description:
      "A 48-hour global online hackathon. Build anything, win prizes, meet builders worldwide.",
    mode: "Online",
    location: "Online",
    prize: "$25,000 in prizes",
    technologies: ["React", "Node.js", "AI", "Python"],
    teamSize: { min: 1, max: 4 },
    startDate: new Date("2026-09-18"),
    endDate: new Date("2026-09-20"),
    registrationDeadline: new Date("2026-09-15"),
    participantsCount: 1840,
  },
  {
    name: "AI for Good Jam",
    slug: "ai-for-good-jam",
    organizer: "DeepMind × UNICEF",
    description:
      "Use AI/ML to tackle real social-impact problems in health, climate and education.",
    mode: "Hybrid",
    location: "London, UK + Online",
    prize: "$15,000 + mentorship",
    technologies: ["Python", "Machine Learning", "AI", "Data Science"],
    teamSize: { min: 2, max: 5 },
    startDate: new Date("2026-10-04"),
    endDate: new Date("2026-10-06"),
    registrationDeadline: new Date("2026-09-28"),
    participantsCount: 920,
  },
  {
    name: "DevLoop Build Sprint",
    slug: "devloop-build-sprint",
    organizer: "DevLoop",
    description:
      "Our flagship weekend sprint — ship a project from zero to demo. Great for first-timers.",
    mode: "Online",
    location: "Online",
    prize: "$5,000 + swag",
    technologies: ["JavaScript", "React", "Node.js"],
    teamSize: { min: 1, max: 3 },
    startDate: new Date("2026-09-27"),
    endDate: new Date("2026-09-28"),
    registrationDeadline: new Date("2026-09-24"),
    participantsCount: 560,
  },
];

/** A 21-day build streak for the flagship demo user. */
export function buildStreakEntries() {
  const items = [
    "React login page",
    "Firebase authentication",
    "Dashboard layout",
    "REST API with Express",
    "AI assistant integration",
    "Dark mode + theming",
    "Profile page",
    "Feed infinite scroll",
    "Code syntax highlighting",
    "Judge0 run-code panel",
    "Build streak heatmap",
    "Hackathon team finder",
    "Notifications center",
    "Deployed to Vercel",
  ];
  const today = new Date();
  return items.map((title, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (items.length - 1 - i));
    return { date: d.toISOString().slice(0, 10), title, description: "", tags: [] };
  });
}
