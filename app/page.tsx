import Link from "next/link";
import { SearchInput } from "@/components/SearchInput";
import { CourseCard } from "@/components/CourseCard";
import { HeroBackground } from "@/components/HeroBackground";
import { AuthCard } from "@/components/AuthCard";
import { listCourses, countCourses } from "@/lib/courses";
import { countReviews } from "@/lib/reviews";

export default async function Home() {
  const [featured, total, totalReviews] = await Promise.all([
    listCourses({ sort: "popular", limit: 6 }),
    countCourses(),
    countReviews(),
  ]);

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative isolate overflow-hidden">
        <HeroBackground />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 sm:py-28 lg:grid-cols-[1.15fr_minmax(0,24rem)]">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
              <span aria-hidden>★</span> Course reviews by Western students
            </span>

            <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
              Pick your next course
              <br />
              with <span className="text-western-300">confidence</span>.
            </h1>

            <p className="mt-5 max-w-xl text-lg text-white/70">
              Honest reviews from students who actually took the class. Browse{" "}
              {total.toLocaleString()} Western courses
              {totalReviews > 0 ? (
                <> and {totalReviews.toLocaleString()} {totalReviews === 1 ? "review" : "reviews"}</>
              ) : (
                ""
              )}
              , see what&rsquo;s worth it, and share your own take.
            </p>

            <div className="mt-8 max-w-xl">
              <SearchInput placeholder="Search “COMPSCI 1027A/B” or “data structures”…" />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/60">
              <Link href="/courses" className="font-medium text-white/90 hover:text-white">
                Browse all courses →
              </Link>
              <span aria-hidden>·</span>
              <span>Free, and open to everyone</span>
            </div>
          </div>

          <div className="animate-fade-up-delay lg:justify-self-end">
            <AuthCard />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- Most reviewed */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            {totalReviews > 0 ? "Most reviewed" : "Featured courses"}
          </h2>
          <Link
            href="/courses"
            className="text-sm font-medium text-western-600 hover:underline dark:text-western-300"
          >
            Browse all →
          </Link>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>
    </>
  );
}
