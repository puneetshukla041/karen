export const SECTORS = [
  "SSC",
  "Railway",
  "Banking",
  "Insurance",
  "Defence",
  "Police",
  "State-Rajasthan",
  "IT-Technical",
  "Postal",
  "Central-Other",
] as const;
export type Sector = (typeof SECTORS)[number];

export type ExamStatus = "open" | "upcoming" | "expected" | "closed-exam-pending" | "closed";
export type Verdict = "yes" | "no" | "check";
export type Difficulty = "low" | "moderate" | "high";

/** One recruitment notification, as stored in the `exams` collection. */
export type Exam = {
  slug: string;
  name: string;
  body: string;
  sector: Sector;
  posts: string[];
  vacancies: number | null;
  vacancyNote: string;
  status: ExamStatus;
  applyStart: string | null;
  applyEnd: string | null;
  examDate: string | null;
  ageMin: number | null;
  ageMax: number | null;
  ageAsOn: string | null;
  qualification: string;
  eligible: Verdict;
  eligibilityNote: string;
  difficulty: Difficulty;
  selectionProcess: string[];
  pay: string;
  feeGeneral: string | null;
  officialUrl: string;
  sources: string[];
  confidence: "official" | "aggregator" | "expected";
  notes: string;
  researchedOn: string;
};

export const APPLICATION_STATUSES = [
  "planning",
  "applied",
  "admit-card",
  "appeared",
  "qualified",
  "selected",
  "not-selected",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const APPLICATION_LABELS: Record<ApplicationStatus, string> = {
  planning: "Planning to apply",
  applied: "Applied",
  "admit-card": "Admit card out",
  appeared: "Appeared",
  qualified: "Qualified stage",
  selected: "Selected",
  "not-selected": "Not selected",
};

/** The user's own tracking record for an exam, in the `applications` collection. */
export type Application = {
  examSlug: string;
  status: ApplicationStatus;
  applicationNo: string;
  appliedOn: string;
  feePaid: boolean;
  examCenter: string;
  notes: string;
  updatedAt: string;
};

export const CATEGORIES = ["General", "EWS", "OBC", "SC", "ST"] as const;
export type Category = (typeof CATEGORIES)[number];

export type Profile = {
  name: string;
  dob: string;
  category: Category;
  gender: "Male" | "Female" | "Other";
  state: string;
  qualification: string;
  graduationYear: string;
  theme: Theme;
};

export const DEFAULT_PROFILE: Profile = {
  name: "",
  dob: "",
  category: "General",
  gender: "Male",
  state: "Rajasthan",
  qualification: "B.Tech Computer Science (AI/ML)",
  graduationYear: "",
  theme: "system",
};

export const THEMES = ["system", "light", "dark"] as const;
export type Theme = (typeof THEMES)[number];
