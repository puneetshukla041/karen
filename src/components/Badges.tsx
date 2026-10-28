import type { ApplicationStatus, Difficulty, ExamStatus, Verdict } from "@/lib/types";
import { APPLICATION_LABELS } from "@/lib/types";

const tone = {
  good: "bg-good/12 text-good ring-good/25",
  warn: "bg-warn/12 text-warn ring-warn/25",
  bad: "bg-bad/12 text-bad ring-bad/25",
  accent: "bg-accent/12 text-accent ring-accent/25",
  muted: "bg-surface-2 text-muted ring-line",
};

export function Pill({ t, children }: { t: keyof typeof tone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tone[t]}`}>
      {children}
    </span>
  );
}

export const STATUS_LABEL: Record<ExamStatus, string> = {
  open: "Open now",
  upcoming: "Opening soon",
  expected: "Expected",
  "closed-exam-pending": "Closed · exam pending",
  closed: "Closed",
};

export function StatusPill({ status }: { status: ExamStatus }) {
  const t = status === "open" ? "good" : status === "upcoming" ? "accent" : status === "expected" ? "warn" : "muted";
  return <Pill t={t}>{STATUS_LABEL[status]}</Pill>;
}

export function EligibilityPill({ verdict }: { verdict: Verdict }) {
  if (verdict === "yes") return <Pill t="good">Eligible</Pill>;
  if (verdict === "no") return <Pill t="bad">Not eligible</Pill>;
  return <Pill t="warn">Check eligibility</Pill>;
}

export function DifficultyPill({ level }: { level: Difficulty }) {
  return <Pill t={level === "low" ? "good" : level === "moderate" ? "warn" : "bad"}>{level[0].toUpperCase() + level.slice(1)}</Pill>;
}

export function MyStatusPill({ status }: { status: ApplicationStatus }) {
  const t = status === "selected" || status === "qualified" ? "good" : status === "not-selected" ? "bad" : status === "planning" ? "muted" : "accent";
  return <Pill t={t}>● {APPLICATION_LABELS[status]}</Pill>;
}
