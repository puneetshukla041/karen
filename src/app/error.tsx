"use client";

import { Icon } from "@/components/Icon";

export default function Error({ error, retry }: { error: Error; retry: () => void }) {
  const db = /ECONNREFUSED|Server selection|MONGODB_URI|querySrv|ENOTFOUND/.test(error.message);
  return (
    <div className="card mx-auto mt-10 max-w-md p-6 text-center">
      <div className="mx-auto mb-3 grid size-11 place-items-center rounded-full bg-bad/10 text-bad">
        <Icon name="alert" className="size-5" />
      </div>
      <h1 className="font-semibold">{db ? "Can't reach the database" : "Something went wrong"}</h1>
      <p className="mt-1.5 text-sm text-muted">
        {db
          ? "Karen keeps everything in MongoDB. Check your internet connection and MONGODB_URI in .env.local, and make sure this network's IP is allowed in MongoDB Atlas."
          : error.message}
      </p>
      <button onClick={() => retry()} className="btn-primary mt-5">
        Try again
      </button>
    </div>
  );
}
