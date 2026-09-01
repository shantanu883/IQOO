import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with conditional logic, de-duping conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Compact number formatting: 1240 → "1.2k". */
export function formatCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `${(n / 1_000_000).toFixed(1)}M`;
}

/** Relative "time ago" from an ISO date string. */
export function timeAgo(date: string | Date): string {
  const then = new Date(date).getTime();
  const secs = Math.round((Date.now() - then) / 1000);
  const table: [number, string][] = [
    [60, "s"],
    [60, "m"],
    [24, "h"],
    [7, "d"],
    [4.35, "w"],
    [12, "mo"],
    [Number.POSITIVE_INFINITY, "y"],
  ];
  let value = secs;
  let unit = "s";
  let acc = 1;
  for (const [step, label] of table) {
    if (value < step) {
      unit = label;
      break;
    }
    acc *= step;
    value = Math.floor(secs / acc);
    unit = label;
  }
  if (secs < 5) return "now";
  return `${value}${unit}`;
}

/** Initials for an avatar fallback. */
export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Format date to readable string (e.g., "Jan 15, 2024"). */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Format relative time (e.g., "2 hours ago"). */
export function formatDistanceToNow(date: Date): string {
  const now = Date.now();
  const then = date.getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)} days ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} months ago`;
  return `${Math.floor(seconds / 31536000)} years ago`;
}
