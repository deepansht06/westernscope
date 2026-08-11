import Link from "next/link";
import { AuthControls } from "./AuthControls";

export function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight"
          aria-label="WesternScope home"
        >
          <span className="text-western-600 dark:text-western-300">Western</span>
          <span className="text-zinc-900 dark:text-zinc-50">Scope</span>
        </Link>
        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <Link href="/courses" className="hover:text-zinc-900 dark:hover:text-zinc-50">
              Courses
            </Link>
          </nav>
          <AuthControls />
        </div>
      </div>
    </header>
  );
}
