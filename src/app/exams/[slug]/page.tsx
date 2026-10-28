import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ApplicationForm } from "@/components/ApplicationForm";
import { DifficultyPill, EligibilityPill, Pill, StatusPill } from "@/components/Badges";
import { getApplications, getExam, getExams, getProfile } from "@/lib/data";
import { hasDatabase } from "@/lib/db";
import { checkEligibility, daysBetween, formatDate, liveStatus, todayIST } from "@/lib/eligibility";
import type { Exam } from "@/lib/types";

export async function generateStaticParams() {
  return (await getExams()).map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/exams/[slug]">): Promise<Metadata> {
  const exam = await getExam((await params).slug);
  return { title: exam?.name ?? "Exam" };
}

export default async function ExamPage({ params }: PageProps<"/exams/[slug]">) {
  const exam = await getExam((await params).slug);
  if (!exam) notFound();

  return (
    <article className="space-y-6">
      <div>
        <Link href="/exams" className="text-sm text-muted hover:text-ink">
          ← My Exams
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{exam.name}</h1>
        <p className="mt-1 text-sm text-muted">
          {exam.body} · {exam.sector.replace("-", " ")}
        </p>
      </div>

      <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-surface" />}>
        <Personal exam={exam} />
      </Suspense>

      <section className="grid gap-4 md:grid-cols-2">
        <Card title="Vacancies & posts">
          <p className="text-2xl font-semibold tabular-nums">
            {exam.vacancies != null ? exam.vacancies.toLocaleString("en-IN") : "Not announced"}
          </p>
          {exam.vacancyNote && <p className="mt-1 text-sm text-muted">{exam.vacancyNote}</p>}
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
            {exam.posts.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </Card>

        <Card title="Dates">
          <Rows
            rows={[
              ["Apply from", formatDate(exam.applyStart)],
              ["Last date", formatDate(exam.applyEnd)],
              ["Exam", exam.examDate ?? "Not announced"],
            ]}
          />
        </Card>

        <Card title="Eligibility (as per notification)">
          <Rows
            rows={[
              ["Qualification", exam.qualification],
              ["Age (General)", `${exam.ageMin ?? "?"} – ${exam.ageMax ?? "?"} years`],
              ["Age counted on", formatDate(exam.ageAsOn)],
            ]}
          />
        </Card>

        <Card title="Job & selection">
          <Rows
            rows={[
              ["Pay", exam.pay || "—"],
              ["Fee (General)", exam.feeGeneral ?? "Not found"],
            ]}
          />
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="text-muted">Difficulty</span> <DifficultyPill level={exam.difficulty} />
          </div>
          {exam.selectionProcess.length > 0 && (
            <ol className="mt-3 flex flex-wrap gap-1.5 text-xs">
              {exam.selectionProcess.map((s, i) => (
                <li key={s} className="rounded-md bg-surface-2 px-2 py-1">
                  {i + 1}. {s}
                </li>
              ))}
            </ol>
          )}
        </Card>
      </section>

      {exam.notes && (
        <Card title="Notes">
          <p className="whitespace-pre-line text-sm leading-relaxed">{exam.notes}</p>
        </Card>
      )}

      <Card title="Sources">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
          <a href={exam.officialUrl} target="_blank" rel="noreferrer" className="rounded-md bg-accent px-3 py-1.5 font-medium text-bg">
            Official site ↗
          </a>
          <Pill t={exam.confidence === "official" ? "good" : exam.confidence === "expected" ? "warn" : "muted"}>
            {exam.confidence === "official" ? "Verified on official site" : exam.confidence === "expected" ? "Expected, not yet notified" : "From coaching/news portals"}
          </Pill>
          <span className="text-xs text-muted">Researched {formatDate(exam.researchedOn)}</span>
        </div>
        <ul className="space-y-1 text-sm">
          {exam.sources.map((s) => (
            <li key={s} className="truncate">
              <a href={s} target="_blank" rel="noreferrer" className="text-muted hover:text-accent">
                {s}
              </a>
            </li>
          ))}
        </ul>
      </Card>
    </article>
  );
}

async function Personal({ exam }: { exam: Exam }) {
  const [apps, profile] = await Promise.all([getApplications(), getProfile()]);
  const today = todayIST();
  const live = liveStatus(exam, today);
  const elig = checkEligibility(exam, profile);
  const left = live === "open" && exam.applyEnd ? daysBetween(today, exam.applyEnd) : null;

  return (
    <section className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
      <Card title="For you">
        <div className="flex flex-wrap gap-1.5">
          <StatusPill status={live} />
          <EligibilityPill verdict={elig.verdict} />
          {left !== null && <Pill t={left <= 7 ? "bad" : "good"}>{left === 0 ? "Closes today" : `${left} days left`}</Pill>}
        </div>
        <ul className="mt-3 space-y-1.5 text-sm">
          {elig.reasons.map((r) => (
            <li key={r} className="text-muted">
              • {r}
            </li>
          ))}
        </ul>
      </Card>
      <Card title="My application">
        <ApplicationForm examSlug={exam.slug} app={apps[exam.slug] ?? null} canSave={hasDatabase()} />
      </Card>
    </section>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">{title}</h2>
      {children}
    </div>
  );
}

function Rows({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="space-y-2 text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[8rem_1fr] gap-2">
          <dt className="text-muted">{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}
