"use client";

import { useOptimistic, useTransition } from "react";
import { setApplicationStatus } from "@/app/actions";
import { APPLICATION_LABELS, APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/types";
import { Icon } from "./Icon";

/** Bookmark toggle for lists. Once you are past "planning" it shows your stage instead. */
export function TrackButton({ slug, status }: { slug: string; status: ApplicationStatus | null }) {
  const [shown, setShown] = useOptimistic(status);
  const [pending, start] = useTransition();
  const tracked = shown !== null;
  const locked = tracked && shown !== "planning";

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    if (locked) return;
    const next = tracked ? null : "planning";
    start(async () => {
      setShown(next);
      await setApplicationStatus(slug, next);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending || locked}
      aria-pressed={tracked}
      title={locked ? APPLICATION_LABELS[shown] : tracked ? "Stop tracking" : "Track this exam"}
      className={`relative z-10 inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition active:scale-95 disabled:cursor-default ${
        tracked ? "bg-accent/12 text-accent" : "border border-line text-muted hover:border-accent/40 hover:text-ink"
      }`}
    >
      <svg viewBox="0 0 24 24" className="size-3.5" fill={tracked ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} aria-hidden>
        <path d="M6 3h12v18l-6-4-6 4z" strokeLinejoin="round" />
      </svg>
      {locked ? APPLICATION_LABELS[shown] : tracked ? "Tracking" : "Track"}
    </button>
  );
}

/** "Mark applied" for the Today list. */
export function MarkAppliedButton({ slug, status }: { slug: string; status: ApplicationStatus | null }) {
  const [shown, setShown] = useOptimistic(status);
  const [pending, start] = useTransition();
  const done = shown !== null && shown !== "planning";

  return (
    <button
      type="button"
      disabled={pending || done}
      onClick={(e) => {
        e.preventDefault();
        start(async () => {
          setShown("applied");
          await setApplicationStatus(slug, "applied");
        });
      }}
      className={`relative z-10 inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition active:scale-95 ${
        done ? "bg-good/12 text-good" : "bg-accent text-accent-ink hover:opacity-90"
      }`}
    >
      {done && <Icon name="check" className="size-3.5" />}
      {done ? "Applied" : "Mark applied"}
    </button>
  );
}

/** Stage picker for the tracker board. */
export function StageSelect({ slug, status }: { slug: string; status: ApplicationStatus }) {
  const [shown, setShown] = useOptimistic(status);
  const [pending, start] = useTransition();
  return (
    <select
      aria-label="Stage"
      value={shown}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as ApplicationStatus;
        start(async () => {
          setShown(next);
          await setApplicationStatus(slug, next);
        });
      }}
      className="field relative z-10 h-8 w-auto py-0 pr-7 text-xs"
    >
      {APPLICATION_STATUSES.map((s) => (
        <option key={s} value={s}>
          {APPLICATION_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
