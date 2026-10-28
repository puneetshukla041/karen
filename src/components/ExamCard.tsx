import Link from "next/link";
import { formatDate } from "@/lib/eligibility";
import { money, sectorLabel, type ExamView } from "@/lib/views";
import { TrackButton } from "./TrackButton";
import { Countdown, DifficultyPill, EligibilityPill, Fact, Pill, StatusPill } from "./ui";

export function ExamCard({ v }: { v: ExamView }) {
  const { exam, live } = v;
  return (
    <li className="card group relative flex flex-col p-4 transition hover:border-accent/40 hover:shadow-[0_4px_24px_-12px] hover:shadow-accent/30">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 truncate pt-1.5 text-xs text-muted">
          {sectorLabel(exam.sector)} · {exam.body}
        </p>
        <TrackButton slug={exam.slug} status={v.app?.status ?? null} />
      </div>

      <Link href={`/exams/${exam.slug}`} className="mt-1 line-clamp-2 font-medium leading-snug after:absolute after:inset-0 group-hover:text-accent">
        {exam.name}
      </Link>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {v.daysLeft !== null ? <Countdown days={v.daysLeft} /> : v.opensIn !== null ? <Countdown days={v.opensIn} opens /> : <StatusPill status={live} />}
        <EligibilityPill verdict={v.elig.verdict} />
        <DifficultyPill level={exam.difficulty} />
        {exam.confidence === "expected" && <Pill>Not notified yet</Pill>}
      </div>

      <div className="grow" />
      <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-3">
        <Fact label="Posts" value={exam.vacancies != null ? exam.vacancies.toLocaleString("en-IN") : "TBA"} />
        <Fact label="Age" value={exam.ageMin != null || exam.ageMax != null ? `${exam.ageMin ?? "?"}–${exam.ageMax ?? "?"}` : "—"} />
        {live === "upcoming" || live === "expected" ? (
          <Fact label="Opens" value={exam.applyStart ? formatDate(exam.applyStart) : "TBA"} />
        ) : live === "open" ? (
          <Fact label="Last date" value={formatDate(exam.applyEnd)} />
        ) : (
          <Fact label="Fee" value={money(exam.feeGeneral)} />
        )}
      </dl>
    </li>
  );
}
