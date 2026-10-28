import type { Category, Exam, ExamStatus, Profile, Verdict } from "./types";

/** Upper-age relaxation in years. Central-govt defaults; state rules differ, so state posts get "check". */
const RELAXATION: Record<Category, number> = { General: 0, EWS: 0, OBC: 3, SC: 5, ST: 5 };

/** Completed years between dob and date (both YYYY-MM-DD). */
export function ageOn(dob: string, on: string): number {
  const [by, bm, bd] = dob.split("-").map(Number);
  const [y, m, d] = on.split("-").map(Number);
  let age = y - by;
  if (m < bm || (m === bm && d < bd)) age--;
  return age;
}

export type EligibilityResult = { verdict: Verdict; reasons: string[] };

export function checkEligibility(exam: Exam, profile: Profile | null): EligibilityResult {
  const reasons: string[] = [];
  const verdict: Verdict = exam.eligible;
  if (exam.eligibilityNote) reasons.push(exam.eligibilityNote);

  if (verdict === "no" || !profile?.dob || (exam.ageMin == null && exam.ageMax == null)) {
    if (!profile?.dob && verdict !== "no") reasons.push("Add your date of birth in Profile for an exact age check.");
    return { verdict, reasons };
  }

  const asOn = exam.ageAsOn ?? `${new Date().getFullYear()}-01-01`;
  const age = ageOn(profile.dob, asOn);
  const isState = exam.sector === "State-Rajasthan";
  const relax = isState ? 0 : RELAXATION[profile.category];
  const max = exam.ageMax != null ? exam.ageMax + relax : null;

  if (exam.ageMin != null && age < exam.ageMin) {
    return { verdict: "no", reasons: [`Age ${age} on ${asOn} is below the minimum ${exam.ageMin}.`, ...reasons] };
  }
  if (max != null && age > max) {
    return {
      verdict: "no",
      reasons: [`Age ${age} on ${asOn} is above the limit ${max}${relax ? ` (incl. ${relax}y ${profile.category} relaxation)` : ""}.`, ...reasons],
    };
  }
  reasons.unshift(
    `Age ${age} on ${asOn} fits ${exam.ageMin ?? "?"}–${max ?? "?"}${relax ? ` (incl. ${relax}y ${profile.category} relaxation)` : ""}.`,
  );
  if (isState && profile.category !== "General") reasons.push("Rajasthan relaxation rules differ by category and gender; check the notification.");
  return { verdict, reasons };
}

/** Status after comparing the stored status against today's date. */
export function liveStatus(exam: Exam, today: string): ExamStatus {
  const { applyStart, applyEnd, status } = exam;
  if (applyEnd && applyEnd < today) return status === "closed" ? "closed" : "closed-exam-pending";
  if (applyStart && applyStart <= today && (!applyEnd || applyEnd >= today)) return "open";
  if (applyStart && applyStart > today) return "upcoming";
  return status;
}

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);
}

export function todayIST(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
