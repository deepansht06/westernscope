import Link from "next/link";
import { codeToSlug } from "@/lib/slug";
import { deleteReview } from "@/lib/actions/reviews";
import type { MyReview } from "@/lib/reviews";

export function MyReviewCard({ review }: { review: MyReview }) {
  const slug = codeToSlug(review.course.code);
  return (
    <li className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-xs font-semibold text-[#4F2683] dark:text-[#A78BFA]">
            {review.course.code}
          </p>
          <Link
            href={`/courses/${slug}`}
            className="text-base font-semibold text-zinc-900 hover:underline dark:text-zinc-50"
          >
            {review.course.title}
          </Link>
        </div>
        <time
          className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400"
          dateTime={review.created_at}
        >
          {new Date(review.created_at).toLocaleDateString("en-CA")}
        </time>
      </div>

      <div className="mt-2 flex flex-wrap gap-2 text-xs">
        {review.liked === true && <Tag color="green">Liked</Tag>}
        {review.liked === false && <Tag color="red">Disliked</Tag>}
        {review.useful === true && <Tag>Useful</Tag>}
        {review.easy === true && <Tag>Easy</Tag>}
        {review.easy === false && <Tag color="amber">Hard</Tag>}
      </div>

      {review.text && (
        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-zinc-800 dark:text-zinc-200">
          {review.text}
        </p>
      )}

      <div className="mt-3 flex items-center gap-4 text-sm">
        <Link
          href={`/courses/${slug}`}
          className="font-medium text-[#4F2683] hover:underline dark:text-[#A78BFA]"
        >
          Edit
        </Link>
        <form action={deleteReview}>
          <input type="hidden" name="course_id" value={review.course_id} />
          <input type="hidden" name="course_slug" value={slug} />
          <button
            type="submit"
            className="font-medium text-red-600 hover:underline dark:text-red-400"
          >
            Delete
          </button>
        </form>
      </div>
    </li>
  );
}

function Tag({
  children,
  color = "zinc",
}: {
  children: React.ReactNode;
  color?: "zinc" | "green" | "red" | "amber";
}) {
  const palette = {
    zinc: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    green: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
    red: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
    amber: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  }[color];
  return (
    <span className={`rounded-full px-2 py-0.5 font-medium ${palette}`}>
      {children}
    </span>
  );
}
