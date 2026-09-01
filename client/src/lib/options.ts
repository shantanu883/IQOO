/* ─────────────────────────────────────────────────────────────
 * DevLoop — shared option sets
 * Used by onboarding, profile editing and discovery filters so the
 * choices stay consistent (and comparable) across the app.
 * ───────────────────────────────────────────────────────────── */
import type { ExperienceLevel, CollabRole } from "@/types";

/**
 * Technologies offered during onboarding.
 * The first block is the core set shown by default; `MORE_TECH_OPTIONS`
 * is revealed behind a "Show more" toggle so step one stays scannable.
 */
export const CORE_TECH_OPTIONS: string[] = [
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Python",
  "Java",
  "C++",
  "C",
  "Flutter",
  "Android",
  "Machine Learning",
  "AI",
  "Data Science",
  "DevOps",
  "Cloud",
  "Cybersecurity",
];

export const MORE_TECH_OPTIONS: string[] = [
  "Next.js",
  "Vue",
  "Svelte",
  "Express",
  "Django",
  "FastAPI",
  "Spring",
  "Go",
  "Rust",
  "Kotlin",
  "Swift",
  "C#",
  ".NET",
  "PHP",
  "Laravel",
  "Ruby on Rails",
  "GraphQL",
  "PostgreSQL",
  "MongoDB",
  "MySQL",
  "Redis",
  "Docker",
  "Kubernetes",
  "AWS",
  "GCP",
  "Azure",
  "Terraform",
  "TensorFlow",
  "PyTorch",
  "Tailwind CSS",
  "React Native",
  "Solidity",
];

export const TECH_OPTIONS: string[] = [
  ...CORE_TECH_OPTIONS,
  ...MORE_TECH_OPTIONS,
];

/** High-level interest areas used for matching and discovery. */
export const INTEREST_OPTIONS: string[] = [
  "Web Development",
  "Mobile Development",
  "AI/ML",
  "Open Source",
  "Competitive Programming",
  "Hackathons",
  "Cybersecurity",
  "Cloud",
  "Data Science",
  "Game Development",
  "Blockchain / Web3",
  "UI/UX Design",
  "Developer Tooling",
  "Startups",
];

export interface ExperienceOption {
  value: ExperienceLevel;
  label: string;
  description: string;
}

/** The three experience tiers shown as selectable cards. */
export const EXPERIENCE_LEVELS: ExperienceOption[] = [
  {
    value: "Beginner",
    label: "Beginner",
    description: "Learning the fundamentals and building my first projects.",
  },
  {
    value: "Intermediate",
    label: "Intermediate",
    description: "Comfortable shipping features and side projects on my own.",
  },
  {
    value: "Advanced",
    label: "Advanced",
    description: "Years of experience building and running production systems.",
  },
];

/** Roles a project can recruit for. Mirrors the CollabRole union. */
export const COLLAB_ROLES: CollabRole[] = [
  "Frontend Developer",
  "Backend Developer",
  "UI/UX Designer",
  "AI/ML Engineer",
  "Mobile Developer",
  "DevOps Engineer",
  "Other",
];

export const PROJECT_CATEGORIES: string[] = [
  "Web App",
  "Mobile App",
  "AI / ML",
  "Developer Tool",
  "Open Source Library",
  "Game",
  "Data / Analytics",
  "Blockchain",
  "Other",
];
