import type { IconName } from "@/components/Icon";

export type NavItem = { href: string; label: string; icon: IconName };

export const NAV: NavItem[] = [
  { href: "/", label: "Today", icon: "home" },
  { href: "/exams", label: "Explore", icon: "compass" },
  { href: "/tracker", label: "Tracker", icon: "kanban" },
  { href: "/profile", label: "Profile", icon: "user" },
];
