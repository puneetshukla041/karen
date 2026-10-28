"use client";

import { useActionState } from "react";
import { removeApplication, saveApplication, type ActionState } from "@/app/actions";
import { APPLICATION_LABELS, APPLICATION_STATUSES, type Application } from "@/lib/types";

export function ApplicationForm({ examSlug, app, canSave }: { examSlug: string; app: Application | null; canSave: boolean }) {
  const [state, save, saving] = useActionState<ActionState, FormData>(saveApplication, null);
  const [removed, remove, removing] = useActionState<ActionState, FormData>(removeApplication, null);
  const msg = removed ?? state;

  return (
    <div>
      <form action={save} className="grid gap-3 sm:grid-cols-2">
        <input type="hidden" name="examSlug" value={examSlug} />
        <Label text="Status">
          <select name="status" defaultValue={app?.status ?? "applied"}>
            {APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {APPLICATION_LABELS[s]}
              </option>
            ))}
          </select>
        </Label>
        <Label text="Applied on">
          <input type="date" name="appliedOn" defaultValue={app?.appliedOn ?? ""} />
        </Label>
        <Label text="Application / registration no.">
          <input name="applicationNo" defaultValue={app?.applicationNo ?? ""} autoComplete="off" />
        </Label>
        <Label text="Exam centre / city">
          <input name="examCenter" defaultValue={app?.examCenter ?? ""} />
        </Label>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" name="feePaid" defaultChecked={app?.feePaid ?? false} /> Fee paid
        </label>
        <Label text="Notes (login ID, preferences, doubts…)" wide>
          <textarea name="notes" rows={3} defaultValue={app?.notes ?? ""} />
        </Label>
        <div className="flex items-center gap-3 sm:col-span-2">
          <button
            disabled={!canSave || saving}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-bg disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving…" : app ? "Update" : "Add to My Exams"}
          </button>
          {app && (
            <button
              formAction={remove}
              disabled={removing}
              className="rounded-md px-3 py-2 text-sm text-muted hover:text-bad disabled:opacity-50"
            >
              Remove
            </button>
          )}
          {msg && <span className={`text-sm ${msg.ok ? "text-good" : "text-bad"}`}>{msg.message}</span>}
        </div>
        {!canSave && <p className="text-xs text-warn sm:col-span-2">Connect MongoDB to save applications.</p>}
      </form>
    </div>
  );
}

function Label({ text, wide, children }: { text: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <label className={`grid gap-1 text-xs text-muted ${wide ? "sm:col-span-2" : ""}`}>
      {text}
      {children}
    </label>
  );
}
