import "server-only";
import { MongoClient, type Db } from "mongodb";

declare global {
  var _karenMongo: Promise<MongoClient> | undefined;
}

/** Reuses one MongoClient across hot reloads and serverless invocations. */
export async function getDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set. Add it to .env.local and restart.");
  if (!global._karenMongo) {
    global._karenMongo = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
    })
      .connect()
      .catch((err) => {
        global._karenMongo = undefined;
        throw err;
      });
  }
  const client = await global._karenMongo;
  // The database keeps its original name so existing data stays where it is.
  return client.db(process.env.MONGODB_DB || "my-prep");
}

export const USER_ID = process.env.KAREN_USER_ID || process.env.MY_PREP_USER_ID || "me";
