/**
 * Shared enums / vocabularies used across models, validators and seed
 * data. Keeping them in one place avoids drift between the schema
 * `enum`s and the values the frontend sends.
 */

export const TECHNOLOGIES = [
  "Java",
  "Python",
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
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

export const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Advanced"];

export const INTERESTS = [
  "Web Development",
  "Mobile Development",
  "AI/ML",
  "Open Source",
  "Competitive Programming",
  "Hackathons",
  "Cybersecurity",
  "Cloud",
  "Data Science",
];

export const POST_TYPES = [
  "code",
  "project",
  "question",
  "tutorial",
  "achievement",
  "post",
];

export const CODE_LANGUAGES = [
  "java",
  "python",
  "javascript",
  "typescript",
  "c",
  "cpp",
  "html",
  "css",
  "jsx",
  "sql",
];

export const COLLAB_ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "UI/UX Designer",
  "AI/ML Engineer",
  "Mobile Developer",
  "DevOps Engineer",
  "Other",
];

export const NOTIFICATION_TYPES = [
  "follow",
  "like",
  "comment",
  "star",
  "collab_request",
  "team_invite",
  "message",
  "achievement",
];

export const AI_ACTIONS = [
  "explain",
  "bugs",
  "optimize",
  "improve",
  "complexity",
  "document",
];

/** Judge0 language id map for the languages we expose. */
export const JUDGE0_LANGUAGE_IDS = {
  java: 62,
  python: 71,
  javascript: 63,
  typescript: 74,
  c: 50,
  cpp: 54,
  sql: 82,
};
