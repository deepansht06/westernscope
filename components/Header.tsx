import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-block h-6 w-6 rounded-sm bg-[#4F2683]" aria-hidden />
          <span className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            WesternScope
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <Link href="/courses" className="hover:text-zinc-900 dark:hover:text-zinc-50">
            Courses
          </Link>
        </nav>
      </div>
    </header>
  );
}
