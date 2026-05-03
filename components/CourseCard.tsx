import Link from "next/link";
import { codeToSlug } from "@/lib/slug";
import type { Course } from "@/lib/courses";

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/courses/${codeToSlug(course.code)}`}
      className="block rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-[#4F2683] hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-[#A78BFA] dark:hover:bg-zinc-900"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-sm font-semibold text-[#4F2683] dark:text-[#A78BFA]">
          {course.code}
        </span>
        {course.credit_weight !== null && (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {course.credit_weight.toFixed(2)} credit
          </span>
        )}
      </div>
      <h3 className="mt-1 text-base font-medium text-zinc-900 dark:text-zinc-50">
        {course.title}
      </h3>
      {course.description && (
        <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
          {course.description}
        </p>
      )}
    </Link>
  );
}
