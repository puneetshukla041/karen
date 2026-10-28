import Link from "next/link";
import { EmptyState } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto mt-10 max-w-md">
      <EmptyState
        icon="compass"
        title="Page not found"
        body="That exam or page doesn't exist anymore."
        action={
          <Link href="/exams" className="btn-primary">
            Back to Explore
          </Link>
        }
      />
    </div>
  );
}
