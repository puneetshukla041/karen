// Runs a real MongoDB server on 127.0.0.1:27017 with data kept in ./.mongo-data,
// so the app works without installing MongoDB. Not needed if you use MongoDB Atlas.
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { MongoMemoryServer } from "mongodb-memory-server";

const dbPath = fileURLToPath(new URL("../.mongo-data/", import.meta.url));
mkdirSync(dbPath, { recursive: true });

const server = await MongoMemoryServer.create({
  instance: { port: 27017, ip: "127.0.0.1", dbPath,storageEngine: "wiredTiger" },
});
console.log(`MongoDB running at ${server.getUri()} (data in .mongo-data). Press Ctrl+C to stop.`);

const stop = async () => {
  await server.stop({ doCleanup: false });
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
