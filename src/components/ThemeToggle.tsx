"use client";

import { useSyncExternalStore, useTransition } from "react";
import { saveTheme } from "@/app/actions";
import { THEMES, type Theme } from "@/lib/types";

const EVENT = "karen-theme";

function read(): Theme {
  const t = document.documentElement.dataset.theme;
  return t === "light" || t === "dark" ? t : "system";
}

function apply(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") delete root.dataset.theme;
  else root.dataset.theme = theme;
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

const ICONS: Record<Theme, React.ReactNode> = {
  system: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </>
  ),
  light: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  dark: <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5" />,
};

/** System / Light / Dark. Applied instantly, then saved to MongoDB so every device follows. */
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, read, () => "system" as Theme);
  const [, start] = useTransition();

  function pick(next: Theme) {
    apply(next);
    start(() => saveTheme(next));
  }

  return (
    <div role="radiogroup" aria-label="Theme" className="inline-flex rounded-lg border border-line bg-surface-2 p-0.5">
      {THEMES.map((t) => (
        <button
          key={t}
          role="radio"
          aria-checked={theme === t}
          aria-label={`${t[0].toUpperCase()}${t.slice(1)} theme`}
          title={`${t[0].toUpperCase()}${t.slice(1)}`}
          onClick={() => pick(t)}
          className={`grid size-7 place-items-center rounded-md transition ${
            theme === t ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden>
            {ICONS[t]}
          </svg>
        </button>
      ))}
    </div>
  );
}
