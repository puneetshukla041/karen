"use client";

import { useActionState } from "react";
import { saveProfile, type ActionState } from "@/app/actions";
import { CATEGORIES, type Profile } from "@/lib/types";
import { Icon } from "./Icon";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveProfile, null);

  return (
    <form action={action} className="space-y-5">
      <Section title="About you" hint="Used to calculate your age on each exam's cut-off date.">
        <Field label="Name">
          <input name="name" defaultValue={profile.name} autoComplete="name" className="field" />
        </Field>
        <Field label="Date of birth">
          <input type="date" name="dob" defaultValue={profile.dob} required className="field" />
        </Field>
        <Field label="Gender">
          <Segmented name="gender" options={["Male", "Female", "Other"]} value={profile.gender} />
        </Field>
        <Field label="Category" hint="Adds age relaxation (OBC +3, SC/ST +5) on central exams.">
          <Segmented name="category" options={CATEGORIES} value={profile.category} />
        </Field>
      </Section>

      <Section title="Education & location">
        <Field label="Highest qualification" wide>
          <input name="qualification" defaultValue={profile.qualification} className="field" />
        </Field>
        <Field label="Graduation year">
          <input name="graduationYear" inputMode="numeric" maxLength={4} defaultValue={profile.graduationYear} className="field" />
        </Field>
        <Field label="Domicile state">
          <input name="state" defaultValue={profile.state} className="field" />
        </Field>
      </Section>

      <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-10 flex items-center gap-3 rounded-2xl border border-line bg-surface/90 p-3 backdrop-blur-xl lg:bottom-4">
        <button disabled={pending} className="btn-primary">
          {pending ? "Saving…" : "Save profile"}
        </button>
        {state && (
          <span role="status" className={`inline-flex items-center gap-1 text-sm ${state.ok ? "text-good" : "text-bad"}`}>
            {state.ok && <Icon name="check" />}
            {state.message}
          </span>
        )}
      </div>
    </form>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <h2 className="text-sm font-semibold">{title}</h2>
      {hint && <p className="mt-0.5 text-sm text-muted">{hint}</p>}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({ label, hint, wide, children }: { label: string; hint?: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className={`grid content-start gap-1.5 ${wide ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-medium text-muted">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </div>
  );
}

function Segmented({ name, options, value }: { name: string; options: readonly string[]; value: string }) {
  return (
    <div className="flex rounded-lg border border-line bg-surface-2 p-0.5">
      {options.map((o) => (
        <label key={o} className="flex-1">
          <input type="radio" name={name} value={o} defaultChecked={o === value} className="peer sr-only" />
          <span className="flex h-8 cursor-pointer items-center justify-center rounded-md text-xs font-medium text-muted transition peer-checked:bg-surface peer-checked:text-ink peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40">
            {o}
          </span>
        </label>
      ))}
    </div>
  );
}
