import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { twoFactorOk } from "@/lib/twofa";
import { listMyReviews } from "@/lib/reviews";
import { MyReviewCard } from "@/components/MyReviewCard";

export const metadata: Metadata = {
  title: "My reviews — WesternScope",
};

export default async function MePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?next=/me");
  if (!(await twoFactorOk())) redirect("/verify?next=/me");

  const reviews = await listMyReviews(user.id);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        My reviews
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Signed in as {user.email}.
      </p>

      <div className="mt-8">
        {reviews.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              You haven&apos;t written any reviews yet.
            </p>
            <Link
              href="/courses"
              className="mt-3 inline-block text-sm font-medium text-[#4F2683] hover:underline dark:text-[#A78BFA]"
            >
              Browse courses →
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {reviews.map((r) => (
              <MyReviewCard key={r.id} review={r} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
