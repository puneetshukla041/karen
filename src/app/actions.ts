"use server";

import { refresh } from "next/cache";
import { getDb, hasDatabase, USER_ID } from "@/lib/db";
import { APPLICATION_STATUSES, CATEGORIES, type ApplicationStatus, type Category } from "@/lib/types";

export type ActionState = { ok: boolean; message: string } | null;

const str = (fd: FormData, key: string, max = 500) => String(fd.get(key) ?? "").trim().slice(0, max);
const isDate = (s: string) => s === "" || /^\d{4}-\d{2}-\d{2}$/.test(s);

function noDb(): ActionState {
  return { ok: false, message: "MongoDB is not connected. Set MONGODB_URI in .env.local and restart." };
}

export async function saveApplication(_prev: ActionState, fd: FormData): Promise<ActionState> {
  if (!hasDatabase()) return noDb();
  const examSlug = str(fd, "examSlug", 120);
  const status = str(fd, "status", 40) as ApplicationStatus;
  const appliedOn = str(fd, "appliedOn", 10);
  if (!examSlug || !APPLICATION_STATUSES.includes(status) || !isDate(appliedOn)) {
    return { ok: false, message: "Invalid input." };
  }
  const db = await getDb();
  await db.collection("applications").updateOne(
    { userId: USER_ID, examSlug },
    {
      $set: {
        status,
        appliedOn,
        applicationNo: str(fd, "applicationNo", 80),
        examCenter: str(fd, "examCenter", 120),
        feePaid: fd.get("feePaid") === "on",
        notes: str(fd, "notes", 2000),
        updatedAt: new Date().toISOString(),
      },
    },
    { upsert: true },
  );
  refresh();
  return { ok: true, message: "Saved." };
}

export async function removeApplication(_prev: ActionState, fd: FormData): Promise<ActionState> {
  if (!hasDatabase()) return noDb();
  const db = await getDb();
  await db.collection("applications").deleteOne({ userId: USER_ID, examSlug: str(fd, "examSlug", 120) });
  refresh();
  return { ok: true, message: "Removed from My Exams." };
}

export async function saveProfile(_prev: ActionState, fd: FormData): Promise<ActionState> {
  if (!hasDatabase()) return noDb();
  const dob = str(fd, "dob", 10);
  const category = str(fd, "category", 10) as Category;
  const gender = str(fd, "gender", 10);
  if (!isDate(dob) || !CATEGORIES.includes(category) || !["Male", "Female", "Other"].includes(gender)) {
    return { ok: false, message: "Invalid input." };
  }
  const db = await getDb();
  await db.collection("profiles").updateOne(
    { userId: USER_ID },
    {
      $set: {
        name: str(fd, "name", 80),
        dob,
        category,
        gender,
        state: str(fd, "state", 40),
        qualification: str(fd, "qualification", 120),
        graduationYear: str(fd, "graduationYear", 4),
      },
    },
    { upsert: true },
  );
  refresh();
  return { ok: true, message: "Profile saved. Eligibility updated." };
}
