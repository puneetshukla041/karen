"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const active = usePathname().startsWith(href);
  return (
    <Link
      href={href}
      className={`rounded-md px-3 py-1.5 transition-colors ${active ? "bg-surface-2 text-ink" : "text-muted hover:text-ink"}`}
    >
      {children}
    </Link>
  );
}
