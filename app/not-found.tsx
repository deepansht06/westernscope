import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center">
      <p className="font-mono text-sm font-semibold text-[#4F2683] dark:text-[#A78BFA]">
        404
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Page not found
      </h1>
      <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
        We couldn&apos;t find what you were looking for. The course may have
        moved or the link might be off.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm">
        <Link
          href="/courses"
          className="inline-flex items-center rounded-md bg-[#4F2683] px-4 py-2 font-medium text-white hover:bg-[#3F1F6A]"
        >
          Browse all courses
        </Link>
        <Link
          href="/"
          className="font-medium text-[#4F2683] hover:underline dark:text-[#A78BFA]"
        >
          Back to home →
        </Link>
      </div>
    </div>
  );
}
