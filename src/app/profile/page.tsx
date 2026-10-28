import type { Metadata } from "next";
import { Suspense } from "react";
import { ProfileForm } from "@/components/ProfileForm";
import { PageHeader, Skeleton } from "@/components/ui";
import { getBoard } from "@/lib/data";
import { ageOn } from "@/lib/eligibility";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <div className="max-w-3xl">
      <PageHeader title="Profile" subtitle="Karen uses this to check every exam's age limit and eligibility. Saved to your account, so it syncs across devices." />
      <Suspense fallback={<Skeleton className="h-[32rem]" />}>
        <ProfileLoader />
      </Suspense>
    </div>
  );
}

async function ProfileLoader() {
  const { profile, views, today } = await getBoard();
  const eligible = views.filter((v) => v.elig.verdict === "yes").length;
  const check = views.filter((v) => v.elig.verdict === "check").length;
  return (
    <div className="space-y-5">
      {profile.dob && (
        <div className="card grid grid-cols-3 divide-x divide-line">
          <Summary label="Age today" value={String(ageOn(profile.dob, today))} />
          <Summary label="Eligible" value={`${eligible}`} sub={`of ${views.length}`} />
          <Summary label="Check rules" value={`${check}`} />
        </div>
      )}
      <ProfileForm profile={profile} />
    </div>
  );
}

function Summary({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
        {value} {sub && <span className="text-sm font-normal text-muted">{sub}</span>}
      </p>
    </div>
  );
}
