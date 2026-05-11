"use client";

import { useState } from "react";
import { deleteReview } from "@/lib/actions/reviews";
import { ReviewForm } from "./ReviewForm";
import { tagLabel } from "@/lib/tags";
import type { Review } from "@/lib/reviews";

type Props = {
  review: Review;
  courseId: string;
  courseSlug: string;
};

export function AuthorReviewSection({ review, courseId, courseSlug }: Props) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="rounded-lg border border-[#4F2683]/40 bg-[#4F2683]/5 p-4 dark:border-[#A78BFA]/40 dark:bg-[#A78BFA]/5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Edit your review
          </h3>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Cancel
          </button>
        </div>
        <ReviewForm
          courseId={courseId}
          courseSlug={courseSlug}
          existing={review}
          onSaved={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#4F2683]/40 bg-[#4F2683]/5 p-4 dark:border-[#A78BFA]/40 dark:bg-[#A78BFA]/5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#4F2683] dark:text-[#A78BFA]">
          Your review
        </h3>
        <time
          className="text-xs text-zinc-500 dark:text-zinc-400"
          dateTime={review.updated_at}
        >
          {new Date(review.updated_at).toLocaleDateString("en-CA")}
        </time>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
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

      {review.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
          {review.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              {tagLabel(t)}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center gap-4 border-t border-[#4F2683]/20 pt-3 text-sm dark:border-[#A78BFA]/20">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="font-medium text-[#4F2683] hover:underline dark:text-[#A78BFA]"
        >
          Edit
        </button>
        <form action={deleteReview}>
          <input type="hidden" name="course_id" value={courseId} />
          <input type="hidden" name="course_slug" value={courseSlug} />
          <button
            type="submit"
            className="font-medium text-red-600 hover:underline dark:text-red-400"
          >
            Delete
          </button>
        </form>
      </div>
    </div>
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
