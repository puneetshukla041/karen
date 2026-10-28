import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";
import seed from "@/data/exams.json";
import { getDb, hasDatabase, USER_ID } from "./db";
import { DEFAULT_PROFILE, type Application, type Exam, type Profile } from "./types";

const seedExams = seed as Exam[];

/**
 * All notifications. Cached for an hour and tagged so a re-seed shows up at once.
 * Falls back to the bundled research file when MongoDB is not configured or is empty.
 */
export async function getExams(): Promise<Exam[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("exams");
  if (!hasDatabase()) return seedExams;
  try {
    const db = await getDb();
    const rows = await db.collection<Exam>("exams").find({}, { projection: { _id: 0 } }).toArray();
    return rows.length ? rows : seedExams;
  } catch (err) {
    console.error("[my-prep] exams read failed, using bundled data:", err);
    return seedExams;
  }
}

export async function getExam(slug: string): Promise<Exam | undefined> {
  return (await getExams()).find((e) => e.slug === slug);
}

/** Per-request: the user's own tracking records, keyed by exam slug. */
export async function getApplications(): Promise<Record<string, Application>> {
  await connection();
  if (!hasDatabase()) return {};
  const db = await getDb();
  const rows = await db
    .collection<Application & { userId: string }>("applications")
    .find({ userId: USER_ID }, { projection: { _id: 0, userId: 0 } })
    .toArray();
  return Object.fromEntries(rows.map((r) => [r.examSlug, r]));
}

export async function getProfile(): Promise<Profile> {
  await connection();
  if (!hasDatabase()) return DEFAULT_PROFILE;
  const db = await getDb();
  const doc = await db
    .collection<Profile & { userId: string }>("profiles")
    .findOne({ userId: USER_ID }, { projection: { _id: 0, userId: 0 } });
  return { ...DEFAULT_PROFILE, ...doc };
}
