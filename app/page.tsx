import Link from "next/link";
import { SearchInput } from "@/components/SearchInput";
import { CourseCard } from "@/components/CourseCard";
import { listCourses, countCourses } from "@/lib/courses";
import { countReviews } from "@/lib/reviews";

export default async function Home() {
  const [recent, total, totalReviews] = await Promise.all([
    listCourses({ limit: 6 }),
    countCourses(),
    countReviews(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
          Find the right course at <span className="text-[#4F2683] dark:text-[#A78BFA]">Western</span>.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          Browse {total.toLocaleString()} courses
          {totalReviews > 0 ? (
            <>
              {" "}and {totalReviews.toLocaleString()}{" "}
              {totalReviews === 1 ? "review" : "reviews"}
            </>
          ) : (
            ""
          )}{" "}
          from fellow Mustangs.
        </p>
        <div className="mx-auto mt-8 max-w-xl">
          <SearchInput placeholder="Try “COMPSCI 1027A/B” or “data structures”…" />
        </div>
      </section>

      <section className="mt-16">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Recent courses
          </h2>
          <Link
            href="/courses"
            className="text-sm font-medium text-[#4F2683] hover:underline dark:text-[#A78BFA]"
          >
            Browse all →
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {recent.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>
    </div>
  );
}
