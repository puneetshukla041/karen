"use client";

import { useActionState, useState, useTransition } from "react";
import { saveApplication, setApplicationStatus, type ActionState } from "@/app/actions";
import { APPLICATION_LABELS, APPLICATION_STATUSES, type Application, type ApplicationStatus } from "@/lib/types";
import { Icon } from "./Icon";

export function ApplicationForm({ examSlug, app }: { examSlug: string; app: Application | null }) {
  const [state, save, saving] = useActionState<ActionState, FormData>(saveApplication, null);
  const [status, setStatus] = useState<ApplicationStatus>(app?.status ?? "applied");
  const [removing, startRemove] = useTransition();
  const [dirty, setDirty] = useState(false);

  if (!app && !dirty) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-muted">Not tracked yet. Track it to get it on your Today list and tracker.</p>
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" onClick={() => setDirty(true)}>
            <Icon name="check" /> I&apos;ve applied
          </button>
          <button
            className="btn-ghost"
            onClick={() => {
              setStatus("planning");
              setDirty(true);
            }}
          >
            <Icon name="bookmark" /> Plan to apply
          </button>
        </div>
      </div>
    );
  }

  return (
    <form action={save} onChange={() => setDirty(true)} className="space-y-4">
      <input type="hidden" name="examSlug" value={examSlug} />
      <input type="hidden" name="status" value={status} />

      <fieldset>
        <legend className="mb-2 text-xs font-medium text-muted">Stage</legend>
        <div className="flex flex-wrap gap-1.5">
          {APPLICATION_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setStatus(s);
                setDirty(true);
              }}
              aria-pressed={status === s}
              className={`h-8 rounded-full border px-3 text-xs font-medium transition ${
                status === s
                  ? s === "not-selected"
                    ? "border-bad/40 bg-bad/10 text-bad"
                    : s === "selected" || s === "qualified"
                      ? "border-good/40 bg-good/10 text-good"
                      : "border-accent/40 bg-accent/10 text-accent"
                  : "border-line text-muted hover:text-ink"
              }`}
            >
              {APPLICATION_LABELS[s]}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-2">
        <Label text="Applied on">
          <input type="date" name="appliedOn" defaultValue={app?.appliedOn ?? ""} className="field" />
        </Label>
        <Label text="Application / registration no.">
          <input name="applicationNo" defaultValue={app?.applicationNo ?? ""} autoComplete="off" className="field" />
        </Label>
        <Label text="Exam centre / city">
          <input name="examCenter" defaultValue={app?.examCenter ?? ""} className="field" />
        </Label>
        <label className="flex h-10 items-center gap-2.5 self-end rounded-lg border border-line px-3 text-sm">
          <input type="checkbox" name="feePaid" defaultChecked={app?.feePaid ?? false} className="size-4 accent-[var(--accent)]" />
          Fee paid
        </label>
        <Label text="Notes" wide>
          <textarea name="notes" rows={3} defaultValue={app?.notes ?? ""} placeholder="Login ID, post preferences, doubts…" className="field" />
        </Label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button disabled={saving} className="btn-primary">
          {saving ? "Saving…" : app ? "Save changes" : "Start tracking"}
        </button>
        {app && (
          <button
            type="button"
            disabled={removing}
            onClick={() => startRemove(() => setApplicationStatus(examSlug, null).then(() => setDirty(false)))}
            className="btn text-muted hover:text-bad"
          >
            <Icon name="trash" /> Stop tracking
          </button>
        )}
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

function Label({ text, wide, children }: { text: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <label className={`grid gap-1.5 text-xs font-medium text-muted ${wide ? "sm:col-span-2" : ""}`}>
      {text}
      {children}
    </label>
  );
}
