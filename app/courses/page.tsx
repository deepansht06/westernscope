import { SearchInput } from "@/components/SearchInput";
import { CourseCard } from "@/components/CourseCard";
import { listCourses } from "@/lib/courses";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const courses = await listCourses({ q });

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

      {courses.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-zinc-300 p-10 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          No courses match your search.
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
