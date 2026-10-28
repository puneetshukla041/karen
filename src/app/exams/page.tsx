import type { Metadata } from "next";
import { Suspense } from "react";
import { ExploreBoard, parseFilters } from "@/components/ExploreBoard";
import { PageHeader, Skeleton } from "@/components/ui";
import { getBoard } from "@/lib/data";
import { formatDate } from "@/lib/eligibility";

export const metadata: Metadata = { title: "Explore" };

export default function ExplorePage({ searchParams }: PageProps<"/exams">) {
  return (
    <>
      <PageHeader title="Explore" subtitle="Government recruitments matched to your profile. Tap Track to follow one." />
      <Suspense fallback={<ExploreSkeleton />}>
        <Board searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Board({ searchParams }: Pick<PageProps<"/exams">, "searchParams">) {
  const [{ views }, sp] = await Promise.all([getBoard(), searchParams]);
  const researchedOn = views.reduce((max, v) => (v.exam.researchedOn > max ? v.exam.researchedOn : max), "");
  return (
    <>
      <ExploreBoard views={views} initial={parseFilters(sp)} />
      <p className="mt-10 text-xs leading-relaxed text-muted">
        Research updated {formatDate(researchedOn || null)}. Dates and vacancies come from official sites where reachable, otherwise from coaching
        portals. Each exam lists its sources. Confirm on the official site before paying a fee.
      </p>
    </>
  );
}

function ExploreSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10" />
      <Skeleton className="h-10 w-80" />
      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-44" />
        ))}
      </div>
    </div>
  );
}
