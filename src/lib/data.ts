import "server-only";
import { connection } from "next/server";
import { cache } from "react";
import seed from "@/data/exams.json";
import { getDb, USER_ID } from "./db";
import { todayIST } from "./eligibility";
import { DEFAULT_PROFILE, type Application, type Exam, type Profile } from "./types";
import { toViews } from "./views";

/**
 * Everything is read from MongoDB on every request, so all your devices see the same data.
 * The first read on an empty database loads the bundled research into the `exams` collection.
 */
export const getExams = cache(async (): Promise<Exam[]> => {
  await connection();
  const col = (await getDb()).collection<Exam>("exams");
  const rows = await col.find({}, { projection: { _id: 0 } }).toArray();
  if (rows.length) return rows;

  const exams = seed as Exam[];
  await col.createIndex({ slug: 1 }, { unique: true });
  await col.bulkWrite(
    exams.map((e) => ({ replaceOne: { filter: { slug: e.slug }, replacement: { ...e }, upsert: true } })),
    { ordered: false },
  );
  return exams;
});

export async function getExam(slug: string): Promise<Exam | undefined> {
  return (await getExams()).find((e) => e.slug === slug);
}

export const getApplications = cache(async (): Promise<Record<string, Application>> => {
  await connection();
  const rows = await (await getDb())
    .collection<Application & { userId: string }>("applications")
    .find({ userId: USER_ID }, { projection: { _id: 0, userId: 0 } })
    .toArray();
  return Object.fromEntries(rows.map((r) => [r.examSlug, r]));
});

export const getProfile = cache(async (): Promise<Profile> => {
  await connection();
  const doc = await (await getDb())
    .collection<Profile & { userId: string }>("profiles")
    .findOne({ userId: USER_ID }, { projection: { _id: 0, userId: 0 } });
  return { ...DEFAULT_PROFILE, ...doc };
});

export const getBoard = cache(async () => {
  const [exams, apps, profile] = await Promise.all([getExams(), getApplications(), getProfile()]);
  const today = todayIST();
  return { views: toViews(exams, apps, profile, today), profile, today };
});
