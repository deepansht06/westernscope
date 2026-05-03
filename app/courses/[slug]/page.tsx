import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCourseByCode } from "@/lib/courses";
import { slugToCode } from "@/lib/slug";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const code = slugToCode(slug);
  if (!code) return { title: "Course not found — WesternScope" };
  const course = await getCourseByCode(code);
  if (!course) return { title: "Course not found — WesternScope" };
  return {
    title: `${course.code} — ${course.title} — WesternScope`,
    description: course.description?.slice(0, 160) ?? undefined,
  };
}

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  const code = slugToCode(slug);
  if (!code) notFound();

  const course = await getCourseByCode(code);
  if (!course) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/courses"
        className="text-sm font-medium text-[#4F2683] hover:underline dark:text-[#A78BFA]"
      >
        ← All courses
      </Link>

      <header className="mt-4">
        <p className="font-mono text-sm font-semibold text-[#4F2683] dark:text-[#A78BFA]">
          {course.code}
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {course.title}
        </h1>
        {course.credit_weight !== null && (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {course.credit_weight.toFixed(2)} credit
            {course.faculty ? ` · ${course.faculty}` : ""}
          </p>
        )}
      </header>

      {course.description && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Description
          </h2>
          <p className="mt-2 whitespace-pre-line text-base leading-7 text-zinc-800 dark:text-zinc-200">
            {course.description}
          </p>
        </section>
      )}

      {course.prereqs && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Prerequisites
          </h2>
          <p className="mt-2 text-base leading-7 text-zinc-800 dark:text-zinc-200">
            {course.prereqs}
          </p>
        </section>
      )}

      <section className="mt-12 rounded-lg border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          No reviews yet
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Reviews open once Google sign-in for @uwo.ca accounts is enabled.
        </p>
      </section>
    </div>
  );
}
