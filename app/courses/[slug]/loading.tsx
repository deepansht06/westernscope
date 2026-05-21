export default function CourseLoading() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />

      <header className="mt-4">
        <div className="h-4 w-28 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-2 h-8 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-3 h-4 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </header>

      <section className="mt-8 space-y-2">
        <div className="h-3 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </section>

      <section className="mt-12">
        <div className="h-3 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-3 h-32 w-full animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      </section>
    </div>
  );
}
