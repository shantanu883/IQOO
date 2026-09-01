import type { LucideIcon } from "lucide-react";
import {
  Home,
  Compass,
  FolderGit2,
  Trophy,
  Bell,
  Bookmark,
} from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** react-router NavLink `end` (exact match) — used for "/". */
  end?: boolean;
}

/** Primary navigation shown in the left sidebar. */
export const mainNav: NavItem[] = [
  { label: "Home", to: "/", icon: Home, end: true },
  { label: "Explore", to: "/explore", icon: Compass },
  { label: "Projects", to: "/projects", icon: FolderGit2 },
  { label: "Hackathons", to: "/hackathons", icon: Trophy },
  { label: "Notifications", to: "/notifications", icon: Bell },
  { label: "Bookmarks", to: "/bookmarks", icon: Bookmark },
];
