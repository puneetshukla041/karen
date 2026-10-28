import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-xl font-semibold">Not found</h1>
      <Link href="/exams" className="mt-3 inline-block text-sm text-accent">
        Back to My Exams
      </Link>
    </div>
  );
}
