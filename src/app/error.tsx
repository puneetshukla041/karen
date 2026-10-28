"use client";

export default function Error({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div className="mx-auto max-w-lg rounded-xl border border-bad/30 bg-bad/8 p-6 text-sm">
      <h1 className="mb-2 font-semibold text-bad">Something went wrong</h1>
      <p className="text-muted">
        {error.message.includes("ECONNREFUSED") || error.message.includes("Server selection")
          ? "Could not reach MongoDB. Start it with `npm run db` (local) or check MONGODB_URI."
          : error.message}
      </p>
      <button onClick={() => retry()} className="mt-4 rounded-md bg-surface-2 px-3 py-1.5">
        Try again
      </button>
    </div>
  );
}
