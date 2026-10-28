"use client";

import { useActionState } from "react";
import { saveProfile, type ActionState } from "@/app/actions";
import { CATEGORIES, type Profile } from "@/lib/types";

export function ProfileForm({ profile, canSave }: { profile: Profile; canSave: boolean }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveProfile, null);

  return (
    <form action={action} className="grid gap-4 rounded-xl border border-line bg-surface p-5 sm:grid-cols-2">
      <Field label="Name">
        <input name="name" defaultValue={profile.name} />
      </Field>
      <Field label="Date of birth">
        <input type="date" name="dob" defaultValue={profile.dob} required />
      </Field>
      <Field label="Category">
        <select name="category" defaultValue={profile.category}>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </Field>
      <Field label="Gender">
        <select name="gender" defaultValue={profile.gender}>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>
      </Field>
      <Field label="Domicile state">
        <input name="state" defaultValue={profile.state} />
      </Field>
      <Field label="Graduation year">
        <input name="graduationYear" inputMode="numeric" maxLength={4} defaultValue={profile.graduationYear} />
      </Field>
      <Field label="Highest qualification" wide>
        <input name="qualification" defaultValue={profile.qualification} />
      </Field>
      <div className="flex items-center gap-3 sm:col-span-2">
        <button
          disabled={!canSave || pending}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-bg disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save profile"}
        </button>
        {state && <span className={`text-sm ${state.ok ? "text-good" : "text-bad"}`}>{state.message}</span>}
        {!canSave && <span className="text-xs text-warn">Connect MongoDB to save.</span>}
      </div>
    </form>
  );
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <label className={`grid gap-1 text-xs text-muted ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      {children}
    </label>
  );
}
