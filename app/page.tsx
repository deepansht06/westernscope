import Link from "next/link";
import { SearchInput } from "@/components/SearchInput";
import { CourseCard } from "@/components/CourseCard";
import { HeroBackground } from "@/components/HeroBackground";
import { AuthCard } from "@/components/AuthCard";
import { listCourses, countCourses } from "@/lib/courses";
import { countReviews } from "@/lib/reviews";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const [featured, total, totalReviews, user] = await Promise.all([
    listCourses({ sort: "popular", limit: 6 }),
    countCourses(),
    countReviews(),
    getCurrentUser(),
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
            {user ? <HeroUserPanel email={user.email} /> : <AuthCard />}
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

function HeroUserPanel({ email }: { email: string | undefined }) {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-black/5 bg-white p-6 shadow-2xl shadow-black/25 dark:border-white/10 dark:bg-zinc-900">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-western-100 text-lg font-semibold text-western-700 dark:bg-western-950 dark:text-western-300">
        {(email?.[0] ?? "?").toUpperCase()}
      </div>
      <p className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Welcome back 👋
      </p>
      <p className="mt-1 truncate text-sm text-zinc-500 dark:text-zinc-400">
        {email}
      </p>
      <div className="mt-5 space-y-2">
        <Link
          href="/courses"
          className="block w-full rounded-lg bg-western-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-western-700"
        >
          Browse courses
        </Link>
        <Link
          href="/me"
          className="block w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          My reviews
        </Link>
      </div>
    </div>
  );
}
