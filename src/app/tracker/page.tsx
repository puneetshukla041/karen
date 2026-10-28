import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Icon } from "@/components/Icon";
import { StageSelect } from "@/components/TrackButton";
import { Countdown, EmptyState, PageHeader, Pill, Skeleton } from "@/components/ui";
import { getBoard } from "@/lib/data";
import { formatDate } from "@/lib/eligibility";
import type { ApplicationStatus } from "@/lib/types";
import type { ExamView } from "@/lib/views";

export const metadata: Metadata = { title: "Tracker" };

const COLUMNS: { title: string; hint: string; statuses: ApplicationStatus[] }[] = [
  { title: "To apply", hint: "Planning", statuses: ["planning"] },
  { title: "Applied", hint: "Waiting for admit card", statuses: ["applied"] },
  { title: "Exam stage", hint: "Admit card, appeared, qualified", statuses: ["admit-card", "appeared", "qualified"] },
  { title: "Result", hint: "Selected or not", statuses: ["selected", "not-selected"] },
];

export default function TrackerPage() {
  return (
    <>
      <PageHeader title="Tracker" subtitle="Every exam you follow, by stage. Change a stage right from the card." />
      <Suspense fallback={<TrackerSkeleton />}>
        <Board />
      </Suspense>
    </>
  );
}

async function Board() {
  const { views } = await getBoard();
  const tracked = views.filter((v) => v.app);
  if (!tracked.length) {
    return (
      <EmptyState
        icon="bookmark"
        title="Nothing tracked yet"
        body="Tap Track on any exam in Explore, or mark one as applied from Today."
        action={
          <Link href="/exams" className="btn-primary">
            Explore exams <Icon name="arrowRight" />
          </Link>
        }
      />
    );
  }

  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 no-scrollbar sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
      {COLUMNS.map((col) => {
        const items = tracked
          .filter((v) => col.statuses.includes(v.app!.status))
          .sort((a, b) => (a.exam.applyEnd ?? "9").localeCompare(b.exam.applyEnd ?? "9"));
        return (
          <section key={col.title} className="w-[82vw] max-w-sm shrink-0 snap-start lg:w-auto lg:max-w-none">
            <div className="mb-3 flex items-baseline justify-between px-1">
              <h2 className="text-sm font-semibold">
                {col.title} <span className="ml-1 font-normal text-muted tabular-nums">{items.length}</span>
              </h2>
              <span className="truncate pl-2 text-xs text-muted">{col.hint}</span>
            </div>
            <ul className="min-h-24 space-y-2.5 rounded-2xl bg-surface-2/60 p-2">
              {items.length ? (
                items.map((v) => <TrackCard key={v.exam.slug} v={v} />)
              ) : (
                <li className="grid h-20 place-items-center text-xs text-muted">Empty</li>
              )}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function TrackCard({ v }: { v: ExamView }) {
  const app = v.app!;
  return (
    <li className="card relative p-3.5 transition hover:border-accent/40">
      <Link href={`/exams/${v.exam.slug}`} className="line-clamp-2 text-sm font-medium leading-snug after:absolute after:inset-0">
        {v.exam.name}
      </Link>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {v.daysLeft !== null && app.status === "planning" && <Countdown days={v.daysLeft} />}
        {app.feePaid && <Pill tone="good">Fee paid</Pill>}
        {app.status !== "planning" && !app.feePaid && <Pill tone="warn">Fee not marked</Pill>}
      </div>
      <dl className="mt-2.5 space-y-1 text-xs text-muted">
        {app.applicationNo && (
          <div className="flex gap-1.5">
            <dt>App no.</dt>
            <dd className="truncate font-medium text-ink">{app.applicationNo}</dd>
          </div>
        )}
        {app.appliedOn && (
          <div className="flex gap-1.5">
            <dt>Applied</dt>
            <dd className="text-ink">{formatDate(app.appliedOn)}</dd>
          </div>
        )}
        <div className="flex gap-1.5">
          <dt>Exam</dt>
          <dd className="truncate text-ink">{v.exam.examDate ?? "Not announced"}</dd>
        </div>
      </dl>
      <div className="mt-3">
        <StageSelect slug={v.exam.slug} status={app.status} />
      </div>
    </li>
  );
}

function TrackerSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="h-72" />
      ))}
    </div>
  );
}
