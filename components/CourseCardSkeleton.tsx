// Placeholder that mirrors the layout of <CourseCard /> while data loads.
export function CourseCardSkeleton() {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-baseline justify-between gap-3">
        <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-3 w-14 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="mt-2 h-5 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-3 space-y-1.5">
        <div className="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-3 w-5/6 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="mt-3 h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}

export function CourseCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid animate-pulse gap-3 sm:grid-cols-2"
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  );
}
