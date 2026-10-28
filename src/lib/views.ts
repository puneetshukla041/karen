import { checkEligibility, daysBetween, liveStatus, type EligibilityResult } from "./eligibility";
import type { Application, Exam, ExamStatus, Profile } from "./types";

/** An exam joined with everything personal about it, computed for one day. */
export type ExamView = {
  exam: Exam;
  live: ExamStatus;
  elig: EligibilityResult;
  app: Application | null;
  /** Days until the last date, while applications are open. */
  daysLeft: number | null;
  /** Days until applications open, while upcoming. */
  opensIn: number | null;
};

export function toViews(exams: Exam[], apps: Record<string, Application>, profile: Profile, today: string): ExamView[] {
  return exams.map((exam) => {
    const live = liveStatus(exam, today);
    return {
      exam,
      live,
      elig: checkEligibility(exam, profile),
      app: apps[exam.slug] ?? null,
      daysLeft: live === "open" && exam.applyEnd ? daysBetween(today, exam.applyEnd) : null,
      opensIn: live === "upcoming" && exam.applyStart ? daysBetween(today, exam.applyStart) : null,
    };
  });
}

export const byDeadline = (a: ExamView, b: ExamView) => (a.exam.applyEnd ?? "9").localeCompare(b.exam.applyEnd ?? "9");
export const byOpening = (a: ExamView, b: ExamView) => (a.exam.applyStart ?? "9").localeCompare(b.exam.applyStart ?? "9");

export function money(fee: string | null): string {
  if (!fee) return "—";
  return fee.replace(/\bRs\.?\s*/gi, "₹");
}

export function sectorLabel(s: string): string {
  return s.replace("-", " ");
}
