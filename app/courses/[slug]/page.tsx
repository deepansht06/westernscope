import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCourseByCode } from "@/lib/courses";
import { slugToCode } from "@/lib/slug";
import { SITE_NAME } from "@/lib/site";
import { getCurrentUser, isUwoEmail } from "@/lib/auth";
import { getMyReviewForCourse } from "@/lib/reviews";
import { ReviewList } from "@/components/ReviewList";
import { ReviewForm } from "@/components/ReviewForm";
import { AuthorReviewSection } from "@/components/AuthorReviewSection";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const code = slugToCode(slug);
  if (!code) return { title: "Course not found" };
  const course = await getCourseByCode(code);
  if (!course) return { title: "Course not found" };

  const title = `${course.code} — ${course.title}`;
  const description =
    course.description?.slice(0, 160) ??
    `Read student reviews for ${course.code} (${course.title}) at Western University on ${SITE_NAME}.`;
  const url = `/courses/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      title: `${title} · ${SITE_NAME}`,
      description,
      url,
      locale: "en_CA",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${SITE_NAME}`,
      description,
    },
  };
}

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  const code = slugToCode(slug);
  if (!code) notFound();

  const course = await getCourseByCode(code);
  if (!course) notFound();

  const user = await getCurrentUser();
  const canReview = !!user && isUwoEmail(user.email);
  const myReview = canReview
    ? await getMyReviewForCourse(course.id, user!.id)
    : null;

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
        {(() => {
          const meta = [
            course.credit_weight !== null
              ? `${course.credit_weight.toFixed(2)} credit`
              : null,
            course.faculty,
            course.campuses?.length ? course.campuses.join(", ") : null,
          ].filter(Boolean);
          return meta.length > 0 ? (
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              {meta.join(" · ")}
            </p>
          ) : null;
        })()}
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

      {course.antireqs && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Antirequisites
          </h2>
          <p className="mt-2 text-base leading-7 text-zinc-800 dark:text-zinc-200">
            {course.antireqs}
          </p>
        </section>
      )}

      {course.extra_info && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Extra information
          </h2>
          <p className="mt-2 text-base leading-7 text-zinc-800 dark:text-zinc-200">
            {course.extra_info}
          </p>
        </section>
      )}

      <section className="mt-12">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Reviews
        </h2>
        <div className="mt-3">
          <ReviewList courseId={course.id} excludeUserId={user?.id} />
        </div>
      </section>

      {myReview && (
        <section className="mt-8">
          <AuthorReviewSection
            review={myReview}
            courseId={course.id}
            courseSlug={slug}
          />
        </section>
      )}

      {!myReview && (
        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Write a review
          </h2>
          <div className="mt-3">
            {!user && (
              <div className="rounded-lg border border-zinc-200 p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                Sign in with your{" "}
                <span className="font-medium">@uwo.ca</span> email to post a
                review.
              </div>
            )}
            {user && !canReview && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
                Reviews are limited to{" "}
                <span className="font-medium">@uwo.ca</span> accounts. You&apos;re
                signed in as {user.email}.
              </div>
            )}
            {canReview && (
              <ReviewForm
                courseId={course.id}
                courseSlug={slug}
                existing={null}
              />
            )}
          </div>
        </section>
      )}
    </div>
  );
}
