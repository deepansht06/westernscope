import { CourseCardSkeletonGrid } from "@/components/CourseCardSkeleton";

export default function CoursesLoading() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="h-9 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-2 h-4 w-56 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />

      <div className="mt-6 h-11 w-full animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-4 flex gap-2">
        <div className="h-8 w-24 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-8 w-24 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-8 w-28 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <div className="mt-6">
        <CourseCardSkeletonGrid count={8} />
      </div>
    </div>
  );
}
