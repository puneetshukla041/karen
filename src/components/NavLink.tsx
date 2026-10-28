"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/nav";
import { Icon } from "./Icon";

function useActiveHref() {
  const path = usePathname();
  return NAV.find((n) => (n.href === "/" ? path === "/" : path.startsWith(n.href)))?.href ?? null;
}

function SideList({ active }: { active: string | null }) {
  return (
    <>
      {NAV.map(({ href, label, icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={active === href ? "page" : undefined}
          className={`flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${
            active === href ? "bg-surface-2 text-ink" : "text-muted hover:bg-surface-2/60 hover:text-ink"
          }`}
        >
          <Icon name={icon} className={`size-[18px] ${active === href ? "text-accent" : ""}`} />
          {label}
        </Link>
      ))}
    </>
  );
}

function TabList({ active }: { active: string | null }) {
  return (
    <>
      {NAV.map(({ href, label, icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={active === href ? "page" : undefined}
          className={`flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium transition ${active === href ? "text-accent" : "text-muted"}`}
        >
          <Icon name={icon} className="size-[22px]" />
          {label}
        </Link>
      ))}
    </>
  );
}

export const SideNav = () => <SideList active={useActiveHref()} />;
export const SideNavFallback = () => <SideList active={null} />;
export const TabNav = () => <TabList active={useActiveHref()} />;
export const TabNavFallback = () => <TabList active={null} />;
