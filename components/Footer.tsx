import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-6 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between dark:text-zinc-400">
        <p>
          WesternScope is an independent student project. Not affiliated with
          Western University.
        </p>
        <nav className="flex items-center gap-4">
          <Link
            href="/about"
            className="hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            About
          </Link>
          <a
            href="https://github.com/deepansht06/westernscope"
            target="_blank"
            rel="noreferrer"
            className="hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
