import type { Metadata } from "next";
import { Suspense } from "react";
import { ProfileForm } from "@/components/ProfileForm";
import { getProfile } from "@/lib/data";
import { hasDatabase } from "@/lib/db";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
      <p className="mt-1 mb-6 text-sm text-muted">Used to check age limits and eligibility on every exam.</p>
      <Suspense fallback={<div className="h-80 animate-pulse rounded-xl bg-surface" />}>
        <ProfileLoader />
      </Suspense>
    </div>
  );
}

async function ProfileLoader() {
  return <ProfileForm profile={await getProfile()} canSave={hasDatabase()} />;
}
