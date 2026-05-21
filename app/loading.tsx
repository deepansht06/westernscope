import { CourseCardSkeletonGrid } from "@/components/CourseCardSkeleton";

export default function HomeLoading() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <section className="flex flex-col items-center text-center">
        <div className="h-10 w-3/4 max-w-xl animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-4 h-5 w-2/3 max-w-lg animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-8 h-11 w-full max-w-xl animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      </section>

      <section className="mt-16">
        <div className="flex items-baseline justify-between">
          <div className="h-6 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="mt-4">
          <CourseCardSkeletonGrid count={6} />
        </div>
      </section>
    </div>
  );
}
