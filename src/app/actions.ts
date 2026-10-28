"use server";

import { refresh } from "next/cache";
import { getDb, USER_ID } from "@/lib/db";
import { todayIST } from "@/lib/eligibility";
import { APPLICATION_STATUSES, CATEGORIES, THEMES, type ApplicationStatus, type Category, type Theme } from "@/lib/types";

export type ActionState = { ok: boolean; message: string } | null;

const str = (fd: FormData, key: string, max = 500) => String(fd.get(key) ?? "").trim().slice(0, max);
const isDate = (s: string) => s === "" || /^\d{4}-\d{2}-\d{2}$/.test(s);
const isSlug = (s: string) => /^[a-z0-9-]{1,120}$/.test(s);

/** One-tap tracking from lists: sets the status (null stops tracking) and keeps every other field. */
export async function setApplicationStatus(examSlug: string, status: ApplicationStatus | null): Promise<ActionState> {
  if (!isSlug(examSlug) || (status !== null && !APPLICATION_STATUSES.includes(status))) {
    return { ok: false, message: "Invalid input." };
  }
  const col = (await getDb()).collection("applications");
  const filter = { userId: USER_ID, examSlug };
  if (status === null) {
    await col.deleteOne(filter);
  } else {
    const existing = await col.findOne(filter, { projection: { appliedOn: 1 } });
    await col.updateOne(
      filter,
      {
        $set: {
          status,
          updatedAt: new Date().toISOString(),
          ...(status === "applied" && !existing?.appliedOn ? { appliedOn: todayIST() } : {}),
        },
        $setOnInsert: {
          applicationNo: "",
          examCenter: "",
          feePaid: false,
          notes: "",
          ...(status === "applied" ? {} : { appliedOn: "" }),
        },
      },
      { upsert: true },
    );
  }
  refresh();
  return { ok: true, message: status ? "Updated." : "Stopped tracking." };
}

export async function saveApplication(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const examSlug = str(fd, "examSlug", 120);
  const status = str(fd, "status", 40) as ApplicationStatus;
  const appliedOn = str(fd, "appliedOn", 10);
  if (!isSlug(examSlug) || !APPLICATION_STATUSES.includes(status) || !isDate(appliedOn)) {
    return { ok: false, message: "Please check the fields and try again." };
  }
  await (await getDb()).collection("applications").updateOne(
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
  return { ok: true, message: "Saved" };
}

export async function saveProfile(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const dob = str(fd, "dob", 10);
  const category = str(fd, "category", 10) as Category;
  const gender = str(fd, "gender", 10);
  if (!isDate(dob) || !CATEGORIES.includes(category) || !["Male", "Female", "Other"].includes(gender)) {
    return { ok: false, message: "Please check the fields and try again." };
  }
  await (await getDb()).collection("profiles").updateOne(
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
  return { ok: true, message: "Saved. Eligibility updated everywhere." };
}

export async function saveTheme(theme: Theme): Promise<void> {
  if (!THEMES.includes(theme)) return;
  await (await getDb()).collection("profiles").updateOne({ userId: USER_ID }, { $set: { theme } }, { upsert: true });
}
