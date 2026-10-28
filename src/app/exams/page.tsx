import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ExamBoard, type BoardRow } from "@/components/ExamBoard";
import { getApplications, getExams, getProfile } from "@/lib/data";
import { hasDatabase } from "@/lib/db";
import { checkEligibility, formatDate, liveStatus, todayIST } from "@/lib/eligibility";

export const metadata: Metadata = { title: "My Exams" };

export default function ExamsPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">My Exams</h1>
        <p className="mt-1 text-sm text-muted">
          Government recruitments for a B.Tech CS (AI/ML) graduate: high vacancies, low to moderate difficulty, permanent posts.
        </p>
      </div>
      <Suspense fallback={<BoardSkeleton />}>
        <Board />
      </Suspense>
    </>
  );
}

async function Board() {
  const [exams, apps, profile] = await Promise.all([getExams(), getApplications(), getProfile()]);
  const today = todayIST();
  const rows: BoardRow[] = exams.map((exam) => ({
    exam,
    live: liveStatus(exam, today),
    eligibility: checkEligibility(exam, profile).verdict,
    app: apps[exam.slug] ?? null,
  }));
  const researchedOn = exams.reduce((max, e) => (e.researchedOn > max ? e.researchedOn : max), "");

  return (
    <>
      {!hasDatabase() && (
        <Notice>
          MongoDB is not connected, so you are seeing the bundled research data and cannot save applications. Run{" "}
          <code className="text-ink">npm run db</code> and set <code className="text-ink">MONGODB_URI</code> in .env.local (see README).
        </Notice>
      )}
      {!profile.dob && hasDatabase() && (
        <Notice>
          Add your date of birth on the <Link href="/profile" className="text-accent underline">Profile</Link> page so age limits are checked exactly.
        </Notice>
      )}
      <ExamBoard rows={rows} today={today} />
      <p className="mt-8 text-xs text-muted">
        Research last updated {formatDate(researchedOn || null)}. Dates and vacancy counts come from official sites where they could be reached and
        from coaching portals otherwise; each exam page lists its sources and confidence. Always confirm on the official site before paying a fee.
      </p>
    </>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return <div className="mb-4 rounded-lg border border-warn/30 bg-warn/8 px-4 py-3 text-sm text-warn">{children}</div>;
}

function BoardSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-20 rounded-xl bg-surface" />
        ))}
      </div>
      <div className="h-10 rounded-lg bg-surface" />
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="h-28 rounded-xl bg-surface" />
      ))}
    </div>
  );
}
