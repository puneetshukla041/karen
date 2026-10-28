import "server-only";
import { MongoClient, type Db } from "mongodb";

declare global {
  var _myPrepMongo: Promise<MongoClient> | undefined;
}

export function hasDatabase() {
  return Boolean(process.env.MONGODB_URI);
}

/** Reuses one MongoClient across hot reloads and serverless invocations. */
export async function getDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set. Add it to .env.local.");
  if (!global._myPrepMongo) {
    global._myPrepMongo = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    })
      .connect()
      .catch((err) => {
        global._myPrepMongo = undefined;
        throw err;
      });
  }
  const client = await global._myPrepMongo;
  return client.db(process.env.MONGODB_DB || "my-prep");
}

export const USER_ID = process.env.MY_PREP_USER_ID || "me";
