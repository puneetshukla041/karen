import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import seed from "@/data/exams.json";
import { ApplicationForm } from "@/components/ApplicationForm";
import { Icon } from "@/components/Icon";
import { Countdown, DifficultyPill, EligibilityPill, Pill, Skeleton, StatusPill } from "@/components/ui";
import { getBoard } from "@/lib/data";
import { formatDate } from "@/lib/eligibility";
import type { Exam } from "@/lib/types";
import { money, sectorLabel, type ExamView } from "@/lib/views";

export async function generateMetadata({ params }: PageProps<"/exams/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: (seed as Exam[]).find((e) => e.slug === slug)?.name ?? "Exam" };
}

export default function ExamPage({ params }: PageProps<"/exams/[slug]">) {
  return (
    <>
      <Link href="/exams" className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <Icon name="arrowLeft" /> Explore
      </Link>
      <Suspense fallback={<DetailSkeleton />}>
        <Detail params={params} />
      </Suspense>
    </>
  );
}

async function Detail({ params }: Pick<PageProps<"/exams/[slug]">, "params">) {
  const [{ slug }, { views, today }] = await Promise.all([params, getBoard()]);
  const v = views.find((x) => x.exam.slug === slug);
  if (!v) notFound();
  const { exam } = v;

  return (
    <article className="space-y-5">
      <header className="space-y-3">
        <p className="text-sm text-muted">
          {sectorLabel(exam.sector)} · {exam.body}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{exam.name}</h1>
        <div className="flex flex-wrap gap-1.5">
          <StatusPill status={v.live} />
          {v.daysLeft !== null && <Countdown days={v.daysLeft} />}
          {v.opensIn !== null && <Countdown days={v.opensIn} opens />}
          <EligibilityPill verdict={v.elig.verdict} />
          <DifficultyPill level={exam.difficulty} />
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <a href={exam.officialUrl} target="_blank" rel="noreferrer" className="btn-primary">
            {v.live === "open" ? "Apply on official site" : "Official site"} <Icon name="external" />
          </a>
        </div>
      </header>

      <dl className="card grid grid-cols-2 divide-line sm:grid-cols-4 sm:divide-x">
        <Big label="Posts" value={exam.vacancies != null ? exam.vacancies.toLocaleString("en-IN") : "TBA"} />
        <Big label="Age limit" value={exam.ageMin != null || exam.ageMax != null ? `${exam.ageMin ?? "?"}–${exam.ageMax ?? "?"}` : "—"} sub="General" />
        <Big label="Fee" value={money(exam.feeGeneral)} sub="General" />
        <Big label="Last date" value={formatDate(exam.applyEnd)} />
      </dl>

      <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-5">
          <Card title="Your application">
            <ApplicationForm key={v.app?.updatedAt ?? "new"} examSlug={exam.slug} app={v.app} />
          </Card>

          <Card title="Can you apply?">
            <EligibilityList v={v} />
            <div className="mt-4 rounded-xl bg-surface-2 p-3 text-sm">
              <p className="text-xs font-medium text-muted">Qualification required</p>
              <p className="mt-1">{exam.qualification}</p>
            </div>
          </Card>

          <Card title="Posts">
            {exam.vacancyNote && <p className="mb-3 text-sm text-muted">{exam.vacancyNote}</p>}
            <ul className="flex flex-wrap gap-1.5">
              {exam.posts.map((p) => (
                <li key={p} className="rounded-lg border border-line px-2.5 py-1 text-sm">
                  {p}
                </li>
              ))}
            </ul>
          </Card>

          {exam.notes && (
            <Card title="Notes">
              <p className="text-sm leading-relaxed whitespace-pre-line">{exam.notes}</p>
            </Card>
          )}
        </div>

        <div className="space-y-5">
          <Card title="Timeline">
            <Timeline exam={exam} today={today} />
          </Card>

          <Card title="Job & selection">
            <p className="text-xs font-medium text-muted">Pay</p>
            <p className="mt-1 text-sm">{exam.pay || "—"}</p>
            {exam.selectionProcess.length > 0 && (
              <>
                <p className="mt-4 text-xs font-medium text-muted">Selection process</p>
                <ol className="mt-2 space-y-2">
                  {exam.selectionProcess.map((s, i) => (
                    <li key={s} className="flex gap-3 text-sm">
                      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-surface-2 text-[11px] font-semibold text-muted">{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ol>
              </>
            )}
          </Card>

          <Card title="Sources">
            <Pill tone={exam.confidence === "official" ? "good" : exam.confidence === "expected" ? "warn" : "muted"}>
              {exam.confidence === "official" ? "Verified on official site" : exam.confidence === "expected" ? "Expected, not notified" : "From news/coaching portals"}
            </Pill>
            <ul className="mt-3 space-y-1.5 text-sm">
              {exam.sources.map((s) => (
                <li key={s}>
                  <a href={s} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-muted hover:text-accent">
                    <Icon name="external" className="size-3.5" />
                    <span className="truncate">{host(s)}</span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted">Researched {formatDate(exam.researchedOn)}</p>
          </Card>
        </div>
      </div>
    </article>
  );
}

function EligibilityList({ v }: { v: ExamView }) {
  const icon = v.elig.verdict === "yes" ? "check" : v.elig.verdict === "no" ? "x" : "info";
  const color = v.elig.verdict === "yes" ? "text-good bg-good/10" : v.elig.verdict === "no" ? "text-bad bg-bad/10" : "text-warn bg-warn/10";
  return (
    <ul className="space-y-2.5">
      {v.elig.reasons.map((r, i) => (
        <li key={r} className="flex gap-3 text-sm">
          <span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${i === 0 ? color : "bg-surface-2 text-muted"}`}>
            <Icon name={i === 0 ? icon : "info"} className="size-3" />
          </span>
          <span className={i === 0 ? "" : "text-muted"}>
            {r}
            {r.startsWith("Add your date of birth") && (
              <Link href="/profile" className="ml-1 text-accent hover:underline">
                Open profile
              </Link>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Timeline({ exam, today }: { exam: Exam; today: string }) {
  const steps = [
    { label: "Applications open", date: exam.applyStart ? formatDate(exam.applyStart) : "TBA", done: !!exam.applyStart && exam.applyStart <= today },
    { label: "Last date to apply", date: exam.applyEnd ? formatDate(exam.applyEnd) : "TBA", done: !!exam.applyEnd && exam.applyEnd < today },
    { label: "Exam", date: exam.examDate ?? "Not announced", done: false },
  ];
  return (
    <ol>
      {steps.map((s, i) => (
        <li key={s.label} className="relative flex gap-3 pb-5 last:pb-0">
          {i < steps.length - 1 && <span className={`absolute top-5 left-[9px] h-[calc(100%-1.25rem)] w-0.5 ${s.done ? "bg-accent" : "bg-line"}`} />}
          <span
            className={`relative mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2 ${
              s.done ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface"
            }`}
          >
            {s.done && <Icon name="check" className="size-3" />}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium">{s.label}</p>
            <p className="text-sm text-muted">{s.date}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <h2 className="mb-4 text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Big({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border-line p-4 [&:nth-child(-n+2)]:border-b [&:nth-child(odd)]:border-r sm:[&:nth-child(-n+2)]:border-b-0 sm:[&:nth-child(odd)]:border-r-0">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 text-lg font-semibold tracking-tight tabular-nums">{value}</dd>
      {sub && <dd className="text-xs text-muted">{sub}</dd>}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-28" />
      <Skeleton className="h-20" />
      <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
        <Skeleton className="h-96" />
        <Skeleton className="h-72" />
      </div>
    </div>
  );
}

function host(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
