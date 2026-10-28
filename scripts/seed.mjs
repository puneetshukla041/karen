// Loads src/data/exams.json into the `exams` collection (upsert by slug) and removes
// exams no longer in the file. Your applications and profile are never touched.
// Usage: npm run seed
import { readFileSync } from "node:fs";
import { MongoClient } from "mongodb";

process.loadEnvFile?.(new URL("../.env.local", import.meta.url));
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set (.env.local).");
  process.exit(1);
}

const exams = JSON.parse(readFileSync(new URL("../src/data/exams.json", import.meta.url), "utf8"));
const client = await new MongoClient(uri, { serverSelectionTimeoutMS: 5000 }).connect();
const db = client.db(process.env.MONGODB_DB || "my-prep");

const col = db.collection("exams");
await col.createIndex({ slug: 1 }, { unique: true });
await db.collection("applications").createIndex({ userId: 1, examSlug: 1 }, { unique: true });
await db.collection("profiles").createIndex({ userId: 1 }, { unique: true });

const res = await col.bulkWrite(exams.map((e) => ({ replaceOne: { filter: { slug: e.slug }, replacement: e, upsert: true } })));
const del = await col.deleteMany({ slug: { $nin: exams.map((e) => e.slug) } });
console.log(`Seeded ${exams.length} exams (${res.upsertedCount} new, ${res.modifiedCount} updated, ${del.deletedCount} removed).`);
await client.close();
