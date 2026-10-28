import Link from "next/link";
import { NavLink } from "./NavLink";

export function Nav() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href="/exams" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid size-7 place-items-center rounded-md bg-accent text-sm font-bold text-bg">MP</span>
          My Prep
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <NavLink href="/exams">My Exams</NavLink>
          <NavLink href="/profile">Profile</NavLink>
        </nav>
      </div>
    </header>
  );
}
