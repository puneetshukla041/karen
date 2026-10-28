import Link from "next/link";
import { APPLICATION_LABELS, type ApplicationStatus, type Difficulty, type ExamStatus, type Verdict } from "@/lib/types";
import { Icon, type IconName } from "./Icon";

const TONE = {
  good: "bg-good/10 text-good",
  warn: "bg-warn/10 text-warn",
  bad: "bg-bad/10 text-bad",
  accent: "bg-accent/10 text-accent",
  muted: "bg-surface-2 text-muted",
};
export type Tone = keyof typeof TONE;

export function Pill({ tone = "muted", icon, children }: { tone?: Tone; icon?: IconName; children: React.ReactNode }) {
  return (
    <span className={`inline-flex h-6 items-center gap-1 whitespace-nowrap rounded-full px-2.5 text-xs font-medium ${TONE[tone]}`}>
      {icon && <Icon name={icon} className="size-3.5" />}
      {children}
    </span>
  );
}

export const EXAM_STATUS: Record<ExamStatus, { label: string; tone: Tone }> = {
  open: { label: "Open", tone: "good" },
  upcoming: { label: "Opening soon", tone: "accent" },
  expected: { label: "Expected", tone: "warn" },
  "closed-exam-pending": { label: "Exam pending", tone: "muted" },
  closed: { label: "Closed", tone: "muted" },
};

export function StatusPill({ status }: { status: ExamStatus }) {
  const s = EXAM_STATUS[status];
  return <Pill tone={s.tone}>{s.label}</Pill>;
}

export function EligibilityPill({ verdict }: { verdict: Verdict }) {
  if (verdict === "yes") return <Pill tone="good" icon="check">Eligible</Pill>;
  if (verdict === "no") return <Pill tone="bad" icon="x">Not eligible</Pill>;
  return <Pill tone="warn" icon="info">Check rules</Pill>;
}

export function DifficultyPill({ level }: { level: Difficulty }) {
  const tone: Tone = level === "low" ? "good" : level === "moderate" ? "warn" : "bad";
  return <Pill tone={tone}>{level === "low" ? "Easy" : level === "moderate" ? "Moderate" : "Tough"}</Pill>;
}

export const APP_TONE: Record<ApplicationStatus, Tone> = {
  planning: "muted",
  applied: "accent",
  "admit-card": "accent",
  appeared: "accent",
  qualified: "good",
  selected: "good",
  "not-selected": "bad",
};

export function AppStatusPill({ status }: { status: ApplicationStatus }) {
  return (
    <Pill tone={APP_TONE[status]} icon="bookmark">
      {APPLICATION_LABELS[status]}
    </Pill>
  );
}

/** "3 days left", coloured by urgency. */
export function Countdown({ days, opens }: { days: number; opens?: boolean }) {
  if (opens) return <Pill tone="accent" icon="calendar">{days <= 0 ? "Opens today" : `Opens in ${days}d`}</Pill>;
  const tone: Tone = days <= 3 ? "bad" : days <= 7 ? "warn" : "good";
  return (
    <Pill tone={tone} icon="clock">
      {days <= 0 ? "Closes today" : days === 1 ? "1 day left" : `${days} days left`}
    </Pill>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3 sm:mb-8">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function SectionTitle({ title, href, linkLabel = "See all" }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-sm font-semibold">{title}</h2>
      {href && (
        <Link href={href} className="inline-flex items-center gap-0.5 text-sm text-muted hover:text-ink">
          {linkLabel} <Icon name="chevronRight" className="size-3.5" />
        </Link>
      )}
    </div>
  );
}

export function EmptyState({ icon, title, body, action }: { icon: IconName; title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="card flex flex-col items-center border-dashed px-6 py-12 text-center">
      <div className="mb-3 grid size-11 place-items-center rounded-full bg-surface-2 text-muted">
        <Icon name={icon} className="size-5" />
      </div>
      <p className="font-medium">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Fact({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 truncate text-sm font-medium tabular-nums">{value}</dd>
      {sub && <dd className="truncate text-xs text-muted">{sub}</dd>}
    </div>
  );
}

export function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-surface-2 ${className}`} />;
}
