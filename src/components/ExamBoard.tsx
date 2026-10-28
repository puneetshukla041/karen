"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { daysBetween, formatDate } from "@/lib/eligibility";
import { SECTORS, type Application, type Exam, type ExamStatus, type Verdict } from "@/lib/types";
import { DifficultyPill, EligibilityPill, MyStatusPill, Pill, StatusPill } from "./Badges";

export type BoardRow = { exam: Exam; live: ExamStatus; eligibility: Verdict; app: Application | null };

const TABS = [
  { key: "mine", label: "My applications" },
  { key: "open", label: "Open now" },
  { key: "upcoming", label: "Upcoming" },
  { key: "pending", label: "Exam pending" },
  { key: "all", label: "All" },
] as const;
type Tab = (typeof TABS)[number]["key"];

function inTab(r: BoardRow, tab: Tab) {
  switch (tab) {
    case "mine":
      return r.app !== null;
    case "open":
      return r.live === "open";
    case "upcoming":
      return r.live === "upcoming" || r.live === "expected";
    case "pending":
      return r.live === "closed-exam-pending";
    case "all":
      return true;
  }
}

const statusRank: Record<ExamStatus, number> = { open: 0, upcoming: 1, expected: 2, "closed-exam-pending": 3, closed: 4 };

export function ExamBoard({ rows, today }: { rows: BoardRow[]; today: string }) {
  const hasMine = rows.some((r) => r.app);
  const [tab, setTab] = useState<Tab>(hasMine ? "mine" : "open");
  const [sector, setSector] = useState("");
  const [hideIneligible, setHideIneligible] = useState(true);
  const [query, setQuery] = useState("");
  const q = useDeferredValue(query.trim().toLowerCase());

  const base = useMemo(
    () =>
      rows.filter(
        (r) =>
          (!hideIneligible || r.eligibility !== "no" || r.app) &&
          (!sector || r.exam.sector === sector) &&
          (!q || `${r.exam.name} ${r.exam.body} ${r.exam.posts.join(" ")}`.toLowerCase().includes(q)),
      ),
    [rows, hideIneligible, sector, q],
  );

  const visible = useMemo(
    () =>
      base
        .filter((r) => inTab(r, tab))
        .sort((a, b) => {
          if (statusRank[a.live] !== statusRank[b.live]) return statusRank[a.live] - statusRank[b.live];
          if (a.live === "open") return (a.exam.applyEnd ?? "9").localeCompare(b.exam.applyEnd ?? "9");
          if (a.live === "upcoming") return (a.exam.applyStart ?? "9").localeCompare(b.exam.applyStart ?? "9");
          return (b.exam.vacancies ?? 0) - (a.exam.vacancies ?? 0);
        }),
    [base, tab],
  );

  const eligibleRows = rows.filter((r) => r.eligibility !== "no");
  const closingSoon = eligibleRows.filter(
    (r) => r.live === "open" && r.exam.applyEnd && daysBetween(today, r.exam.applyEnd) <= 7,
  ).length;

  return (
    <div>
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="My applications" value={rows.filter((r) => r.app && r.app.status !== "planning").length} />
        <Stat label="Open now (eligible)" value={eligibleRows.filter((r) => r.live === "open").length} tone="good" />
        <Stat label="Closing in 7 days" value={closingSoon} tone={closingSoon ? "bad" : undefined} />
        <Stat label="Upcoming (eligible)" value={eligibleRows.filter((r) => r.live === "upcoming" || r.live === "expected").length} tone="accent" />
      </div>

      <div className="mb-4 flex flex-wrap gap-1 border-b border-line">
        {TABS.map((t) => {
          const count = base.filter((r) => inTab(r, t.key)).length;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`-mb-px border-b-2 px-3 py-2 text-sm transition-colors ${
                tab === t.key ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {t.label} <span className="ml-1 text-xs text-muted">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search exam, body or post…"
          className="sm:max-w-xs"
          aria-label="Search"
        />
        <select value={sector} onChange={(e) => setSector(e.target.value)} className="sm:max-w-48" aria-label="Sector">
          <option value="">All sectors</option>
          {SECTORS.map((s) => (
            <option key={s} value={s}>
              {s.replace("-", " ")}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-muted sm:ml-auto">
          <input type="checkbox" checked={hideIneligible} onChange={(e) => setHideIneligible(e.target.checked)} />
          Hide not-eligible
        </label>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line px-6 py-12 text-center text-sm text-muted">
          {tab === "mine"
            ? "Nothing tracked yet. Open any exam and mark it as Applied or Planning."
            : "No exams match these filters."}
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((r) => (
            <ExamCard key={r.exam.slug} row={r} today={today} />
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "good" | "bad" | "accent" }) {
  const color = tone === "good" ? "text-good" : tone === "bad" ? "text-bad" : tone === "accent" ? "text-accent" : "text-ink";
  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-3">
      <div className={`text-2xl font-semibold tabular-nums ${color}`}>{value}</div>
      <div className="mt-0.5 text-xs text-muted">{label}</div>
    </div>
  );
}

function ExamCard({ row, today }: { row: BoardRow; today: string }) {
  const { exam, live, eligibility, app } = row;
  const left = live === "open" && exam.applyEnd ? daysBetween(today, exam.applyEnd) : null;
  const opensIn = live === "upcoming" && exam.applyStart ? daysBetween(today, exam.applyStart) : null;

  return (
    <li>
      <Link
        href={`/exams/${exam.slug}`}
        className="block rounded-xl border border-line bg-surface p-4 transition-colors hover:border-accent/50 hover:bg-surface-2"
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-medium leading-snug">{exam.name}</h2>
            <p className="mt-0.5 text-xs text-muted">
              {exam.body} · {exam.sector.replace("-", " ")}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {app && <MyStatusPill status={app.status} />}
            <StatusPill status={live} />
          </div>
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
          <Field label="Vacancies">{exam.vacancies != null ? exam.vacancies.toLocaleString("en-IN") : "Not announced"}</Field>
          <Field label="Apply window">
            {exam.applyStart || exam.applyEnd ? `${formatDate(exam.applyStart)} – ${formatDate(exam.applyEnd)}` : "Not announced"}
          </Field>
          <Field label="Exam">{exam.examDate ?? "Not announced"}</Field>
          <Field label="Age (General)">
            {exam.ageMin ?? "?"}–{exam.ageMax ?? "?"}
          </Field>
        </dl>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <EligibilityPill verdict={eligibility} />
          <DifficultyPill level={exam.difficulty} />
          {left !== null && <Pill t={left <= 7 ? "bad" : "good"}>{left === 0 ? "Closes today" : `${left} days left`}</Pill>}
          {opensIn !== null && <Pill t="accent">Opens in {opensIn} days</Pill>}
          {exam.confidence !== "official" && <Pill t="muted">{exam.confidence === "expected" ? "Expected, not notified" : "Unofficial source"}</Pill>}
        </div>
      </Link>
    </li>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="truncate">{children}</dd>
    </div>
  );
}
