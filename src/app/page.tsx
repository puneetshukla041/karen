import Link from "next/link";
import { Suspense } from "react";
import { Icon, type IconName } from "@/components/Icon";
import { MarkAppliedButton } from "@/components/TrackButton";
import { AppStatusPill, Countdown, EligibilityPill, SectionTitle, Skeleton } from "@/components/ui";
import { getBoard } from "@/lib/data";
import { formatDate } from "@/lib/eligibility";
import { APPLICATION_LABELS, APPLICATION_STATUSES } from "@/lib/types";
import { byDeadline, byOpening, money, type ExamView } from "@/lib/views";

export default function TodayPage() {
  return (
    <Suspense fallback={<TodaySkeleton />}>
      <Today />
    </Suspense>
  );
}

function greeting() {
  const h = Number(new Date().toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

async function Today() {
  const { views, profile, today } = await getBoard();
  const eligible = views.filter((v) => v.elig.verdict !== "no");
  const toApply = eligible.filter((v) => v.live === "open" && (!v.app || v.app.status === "planning")).sort(byDeadline);
  const urgent = toApply.filter((v) => v.daysLeft !== null && v.daysLeft <= 7);
  const opening = eligible.filter((v) => v.live === "upcoming").sort(byOpening).slice(0, 5);
  const tracked = views.filter((v) => v.app);
  const applied = tracked.filter((v) => v.app!.status !== "planning");
  const firstName = profile.name.trim().split(/\s+/)[0];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted">
          {new Date(`${today}T00:00:00`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          {greeting()}
          {firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          {urgent.length
            ? `${urgent.length} exam${urgent.length > 1 ? "s" : ""} you can apply for close${urgent.length > 1 ? "" : "s"} within a week.`
            : toApply.length
              ? `${toApply.length} open exam${toApply.length > 1 ? "s" : ""} you haven't applied to yet.`
              : "Nothing urgent. You're up to date."}
        </p>
      </div>

      {!profile.dob && (
        <Link href="/profile" className="card flex items-center gap-4 border-accent/30 bg-accent/5 p-4 transition hover:bg-accent/10">
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
            <Icon name="sparkles" className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Add your date of birth</p>
            <p className="text-sm text-muted">Karen checks every age limit for you once it knows your age and category.</p>
          </div>
          <Icon name="chevronRight" className="size-5 text-muted" />
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon="flag" label="Open for you" value={eligible.filter((v) => v.live === "open").length} href="/exams?status=open" />
        <Stat icon="clock" label="Closing this week" value={urgent.length} tone={urgent.length ? "bad" : undefined} href="/exams?status=open&sort=deadline" />
        <Stat icon="bookmark" label="Tracking" value={tracked.length} href="/tracker" />
        <Stat icon="check" label="Applied" value={applied.length} tone="good" href="/tracker" />
      </div>

      <section>
        <SectionTitle title="Apply next" href="/exams?status=open&sort=deadline" />
        {toApply.length ? (
          <ul className="card divide-y divide-line overflow-hidden">
            {toApply.slice(0, 6).map((v) => (
              <ApplyRow key={v.exam.slug} v={v} />
            ))}
          </ul>
        ) : (
          <div className="card p-6 text-sm text-muted">No open exams waiting on you. Check what&apos;s opening soon below.</div>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <SectionTitle title="Opening soon" href="/exams?status=upcoming" />
          {opening.length ? (
            <ul className="card divide-y divide-line overflow-hidden">
              {opening.map((v) => (
                <li key={v.exam.slug}>
                  <Link href={`/exams/${v.exam.slug}`} className="flex items-center gap-3 px-4 py-3 transition hover:bg-surface-2/60">
                    <DateTile iso={v.exam.applyStart} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{v.exam.name}</p>
                      <p className="truncate text-xs text-muted">
                        {v.exam.vacancies ? `${v.exam.vacancies.toLocaleString("en-IN")} posts · ` : ""}
                        {v.exam.body}
                      </p>
                    </div>
                    {v.opensIn !== null && <Countdown days={v.opensIn} opens />}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="card p-6 text-sm text-muted">No confirmed openings ahead right now.</div>
          )}
        </section>

        <section>
          <SectionTitle title="Your pipeline" href="/tracker" linkLabel="Open tracker" />
          <div className="card p-4">
            {tracked.length ? (
              <>
                <Pipeline views={tracked} />
                <ul className="mt-4 space-y-2">
                  {tracked
                    .filter((v) => v.app!.status !== "planning")
                    .sort((a, b) => (b.app!.updatedAt ?? "").localeCompare(a.app!.updatedAt ?? ""))
                    .slice(0, 4)
                    .map((v) => (
                      <li key={v.exam.slug}>
                        <Link href={`/exams/${v.exam.slug}`} className="flex items-center justify-between gap-3 rounded-lg py-1 text-sm hover:text-accent">
                          <span className="truncate">{v.exam.name}</span>
                          <AppStatusPill status={v.app!.status} />
                        </Link>
                      </li>
                    ))}
                </ul>
              </>
            ) : (
              <p className="text-sm text-muted">
                Tap <span className="font-medium text-ink">Track</span> on any exam in{" "}
                <Link href="/exams" className="text-accent hover:underline">
                  Explore
                </Link>{" "}
                and it shows up here.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function ApplyRow({ v }: { v: ExamView }) {
  const { exam } = v;
  return (
    <li className="relative flex flex-col gap-3 px-4 py-3.5 transition hover:bg-surface-2/60 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <Link href={`/exams/${exam.slug}`} className="font-medium leading-snug after:absolute after:inset-0">
          {exam.name}
        </Link>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <span>Last date {formatDate(exam.applyEnd)}</span>
          {exam.vacancies != null && <span>{exam.vacancies.toLocaleString("en-IN")} posts</span>}
          <span>Fee {money(exam.feeGeneral)}</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {v.daysLeft !== null && <Countdown days={v.daysLeft} />}
        {v.elig.verdict !== "yes" && <EligibilityPill verdict={v.elig.verdict} />}
        <MarkAppliedButton slug={exam.slug} status={v.app?.status ?? null} />
      </div>
    </li>
  );
}

function Stat({ icon, label, value, tone, href }: { icon: IconName; label: string; value: number; tone?: "good" | "bad"; href: string }) {
  return (
    <Link href={href} className="card group p-4 transition hover:border-accent/40">
      <div className="flex items-center justify-between text-muted">
        <span className="text-xs font-medium">{label}</span>
        <Icon name={icon} className="size-4 transition group-hover:text-accent" />
      </div>
      <p className={`mt-2 text-3xl font-semibold tracking-tight tabular-nums ${tone === "bad" ? "text-bad" : tone === "good" ? "text-good" : ""}`}>
        {value}
      </p>
    </Link>
  );
}

function DateTile({ iso }: { iso: string | null }) {
  const d = iso ? new Date(`${iso}T00:00:00`) : null;
  return (
    <div className="grid w-11 shrink-0 place-items-center rounded-lg bg-surface-2 py-1 text-center">
      <span className="text-[10px] font-medium uppercase text-muted">{d ? d.toLocaleDateString("en-IN", { month: "short" }) : "TBA"}</span>
      <span className="text-base font-semibold leading-tight tabular-nums">{d ? d.getDate() : "–"}</span>
    </div>
  );
}

function Pipeline({ views }: { views: ExamView[] }) {
  const counts = APPLICATION_STATUSES.map((s) => ({ s, n: views.filter((v) => v.app!.status === s).length })).filter((c) => c.n);
  return (
    <div>
      <div className="flex h-2 overflow-hidden rounded-full bg-surface-2">
        {counts.map(({ s, n }) => (
          <div
            key={s}
            style={{ width: `${(n / views.length) * 100}%` }}
            className={
              s === "selected" || s === "qualified" ? "bg-good" : s === "not-selected" ? "bg-bad" : s === "planning" ? "bg-muted/40" : "bg-accent"
            }
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        {counts.map(({ s, n }) => (
          <span key={s}>
            <span className="font-semibold text-ink tabular-nums">{n}</span> {APPLICATION_LABELS[s]}
          </span>
        ))}
      </div>
    </div>
  );
}

function TodaySkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-80" />
    </div>
  );
}
