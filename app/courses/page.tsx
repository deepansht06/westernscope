import type { Metadata } from "next";
import Link from "next/link";
import { SearchInput } from "@/components/SearchInput";
import { CourseCard } from "@/components/CourseCard";
import { CourseFilters } from "@/components/CourseFilters";
import {
  listCourses,
  type CourseSort,
  type YearLevel,
} from "@/lib/courses";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Browse and search every Western University course on WesternScope. Filter by year level and sort by most reviewed or most liked.",
  alternates: { canonical: "/courses" },
};

type SearchParams = {
  q?: string;
  year?: string;
  sort?: string;
  reviewed?: string;
};

function parseYear(v: string | undefined): YearLevel | undefined {
  if (v === "1" || v === "2" || v === "3" || v === "4") return v;
  return undefined;
}

function parseSort(v: string | undefined): CourseSort | undefined {
  if (v === "code" || v === "popular" || v === "liked") return v;
  return undefined;
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q, year, sort, reviewed } = await searchParams;
  const courses = await listCourses({
    q,
    yearLevel: parseYear(year),
    sort: parseSort(sort),
    hasReviews: reviewed === "1",
  });

  const hasActiveFilters =
    !!q?.trim() || !!parseYear(year) || reviewed === "1";

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Courses
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Showing {courses.length} {courses.length === 1 ? "course" : "courses"}
        {q ? ` matching “${q}”` : ""}.
      </p>

      <div className="mt-6">
        <SearchInput defaultValue={q ?? ""} />
      </div>

      <div className="mt-4">
        <CourseFilters />
      </div>

      {courses.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
          {hasActiveFilters ? (
            <>
              <p className="text-zinc-600 dark:text-zinc-400">
                No courses match
                {q?.trim() ? (
                  <>
                    {" "}
                    “<span className="font-medium">{q.trim()}</span>”
                  </>
                ) : (
                  " these filters"
                )}
                .
              </p>
              <Link
                href="/courses"
                className="mt-3 inline-block text-sm font-medium text-[#4F2683] hover:underline dark:text-[#A78BFA]"
              >
                Clear filters
              </Link>
            </>
          ) : (
            <p className="text-zinc-600 dark:text-zinc-400">
              No courses yet. Check back soon.
            </p>
          )}
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
