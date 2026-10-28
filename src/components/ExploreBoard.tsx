"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { SECTORS } from "@/lib/types";
import { byDeadline, byOpening, sectorLabel, type ExamView } from "@/lib/views";
import { ExamCard } from "./ExamCard";
import { Icon } from "./Icon";
import { EmptyState } from "./ui";

const STATUS_TABS = [
  { key: "open", label: "Open" },
  { key: "upcoming", label: "Upcoming" },
  { key: "pending", label: "Exam pending" },
  { key: "all", label: "All" },
] as const;
export type StatusTab = (typeof STATUS_TABS)[number]["key"];

const SORTS = [
  { key: "deadline", label: "Closing first" },
  { key: "vacancies", label: "Most posts" },
  { key: "easiest", label: "Easiest first" },
] as const;
export type Sort = (typeof SORTS)[number]["key"];

export type Filters = { q: string; status: StatusTab; sector: string; all: boolean; sort: Sort };

export function parseFilters(sp: Record<string, string | string[] | undefined>): Filters {
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const status = STATUS_TABS.find((t) => t.key === one("status"))?.key ?? "open";
  const sort = SORTS.find((s) => s.key === one("sort"))?.key ?? "deadline";
  const sector = (SECTORS as readonly string[]).includes(one("sector")) ? one("sector") : "";
  return { q: one("q"), status, sector, all: one("eligible") === "all", sort };
}

function inTab(v: ExamView, tab: StatusTab) {
  if (tab === "open") return v.live === "open";
  if (tab === "upcoming") return v.live === "upcoming" || v.live === "expected";
  if (tab === "pending") return v.live === "closed-exam-pending";
  return true;
}

const DIFF = { low: 0, moderate: 1, high: 2 };

export function ExploreBoard({ views, initial }: { views: ExamView[]; initial: Filters }) {
  const [f, setF] = useState(initial);
  const q = useDeferredValue(f.q.trim().toLowerCase());
  const set = (patch: Partial<Filters>) => setF((prev) => ({ ...prev, ...patch }));

  // Keep filters in the URL so back/forward and shared links work.
  useEffect(() => {
    const p = new URLSearchParams();
    if (f.q) p.set("q", f.q);
    if (f.status !== "open") p.set("status", f.status);
    if (f.sector) p.set("sector", f.sector);
    if (f.all) p.set("eligible", "all");
    if (f.sort !== "deadline") p.set("sort", f.sort);
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [f]);

  const base = useMemo(
    () =>
      views.filter(
        (v) =>
          (f.all || v.elig.verdict !== "no" || v.app) &&
          (!f.sector || v.exam.sector === f.sector) &&
          (!q || `${v.exam.name} ${v.exam.body} ${v.exam.posts.join(" ")}`.toLowerCase().includes(q)),
      ),
    [views, f.all, f.sector, q],
  );

  const shown = useMemo(() => {
    const list = base.filter((v) => inTab(v, f.status));
    if (f.sort === "vacancies") return list.sort((a, b) => (b.exam.vacancies ?? -1) - (a.exam.vacancies ?? -1));
    if (f.sort === "easiest") return list.sort((a, b) => DIFF[a.exam.difficulty] - DIFF[b.exam.difficulty] || byDeadline(a, b));
    return list.sort((a, b) => (a.live === "upcoming" && b.live === "upcoming" ? byOpening(a, b) : byDeadline(a, b)));
  }, [base, f.status, f.sort]);

  const sectorsPresent = SECTORS.filter((s) => views.some((v) => v.exam.sector === s));
  const filtered = f.q || f.sector || f.all;

  return (
    <div>
      <div className="sticky top-14 z-20 -mx-4 mb-5 space-y-3 border-b border-line bg-bg/85 px-4 pt-1 pb-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:top-0 lg:-mx-10 lg:px-10 lg:pt-4">
        <div className="flex gap-2">
          <label className="relative flex-1">
            <Icon name="search" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={f.q}
              onChange={(e) => set({ q: e.target.value })}
              placeholder="Search exams, boards or posts"
              aria-label="Search"
              className="field pl-9"
            />
          </label>
          <select value={f.sort} onChange={(e) => set({ sort: e.target.value as Sort })} aria-label="Sort" className="field w-auto max-w-40">
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto rounded-xl bg-surface-2 p-1 no-scrollbar sm:inline-flex">
          {STATUS_TABS.map((t) => {
            const n = base.filter((v) => inTab(v, t.key)).length;
            const active = f.status === t.key;
            return (
              <button
                key={t.key}
                onClick={() => set({ status: t.key })}
                aria-pressed={active}
                className={`flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium whitespace-nowrap transition ${
                  active ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
                }`}
              >
                {t.label}
                <span className={`text-xs tabular-nums ${active ? "text-accent" : ""}`}>{n}</span>
              </button>
            );
          })}
        </div>

        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:flex-wrap sm:px-0">
          <Chip active={!f.all} onClick={() => set({ all: !f.all })} icon>
            Eligible only
          </Chip>
          <span className="my-1 w-px shrink-0 bg-line" />
          <Chip active={!f.sector} onClick={() => set({ sector: "" })}>
            All sectors
          </Chip>
          {sectorsPresent.map((s) => (
            <Chip key={s} active={f.sector === s} onClick={() => set({ sector: f.sector === s ? "" : s })}>
              {sectorLabel(s)}
            </Chip>
          ))}
        </div>
      </div>

      <p className="mb-3 text-sm text-muted" aria-live="polite">
        {shown.length} exam{shown.length === 1 ? "" : "s"}
        {filtered && (
          <button onClick={() => set({ q: "", sector: "", all: false })} className="ml-2 font-medium text-accent hover:underline">
            Clear filters
          </button>
        )}
      </p>

      {shown.length ? (
        <ul className="grid gap-3 md:grid-cols-2">
          {shown.map((v) => (
            <ExamCard key={v.exam.slug} v={v} />
          ))}
        </ul>
      ) : (
        <EmptyState
          icon="search"
          title="No exams match"
          body={f.status === "open" ? "Nothing open matches these filters. Try Upcoming, or include exams you're not eligible for." : "Try a different search or sector."}
          action={
            <button className="btn-ghost" onClick={() => set({ q: "", sector: "", all: true, status: "all" })}>
              Show everything
            </button>
          }
        />
      )}
    </div>
  );
}

function Chip({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition ${
        active ? "border-accent/40 bg-accent/10 text-accent" : "border-line bg-surface text-muted hover:text-ink"
      }`}
    >
      {icon && active && <Icon name="check" className="size-3.5" />}
      {children}
    </button>
  );
}
