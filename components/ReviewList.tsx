import {
  listReviewsForCourse,
  summarizeReviews,
  summarizeTags,
} from "@/lib/reviews";
import { tagLabel } from "@/lib/tags";
import { ReviewRatings } from "@/components/ReviewRatings";

export async function ReviewList({
  courseId,
  excludeUserId,
}: {
  courseId: string;
  excludeUserId?: string;
}) {
  const reviews = await listReviewsForCourse(courseId);

  if (reviews.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          No reviews yet - be the first.
        </p>
      </div>
    );
  }

  const summary = summarizeReviews(reviews);
  const tagCounts = summarizeTags(reviews);
  const visible = excludeUserId
    ? reviews.filter((r) => r.user_id !== excludeUserId)
    : reviews;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Based on {summary.count} {summary.count === 1 ? "review" : "reviews"}
        </div>
        <div className="space-y-2">
          <Bar label="Liked" avg={summary.likedAvg} />
          <Bar label="Useful" avg={summary.usefulAvg} />
          <Bar label="Difficulty" avg={summary.difficultyAvg} />
        </div>
        {tagCounts.length > 0 && (
          <div className="mt-4 border-t border-zinc-200 pt-3 dark:border-zinc-800">
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Reviewers say
            </div>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {tagCounts.map((tc) => (
                <span
                  key={tc.tag}
                  className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  <span>{tagLabel(tc.tag)}</span>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    · {tc.count}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      {visible.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          No other reviews yet.
        </div>
      ) : (
      <ul className="space-y-3">
        {visible.map((r) => (
          <li
            key={r.id}
            className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <ReviewRatings
                liked={r.liked}
                useful={r.useful}
                difficulty={r.difficulty}
              />
              <time
                className="ml-auto text-zinc-500 dark:text-zinc-400"
                dateTime={r.created_at}
              >
                {new Date(r.created_at).toLocaleDateString("en-CA")}
              </time>
            </div>
            {r.text && (
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-zinc-800 dark:text-zinc-200">
                {r.text}
              </p>
            )}
            {r.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                {r.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    {tagLabel(t)}
                  </span>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
      )}
    </div>
  );
}

function Bar({ label, avg }: { label: string; avg: number | null }) {
  const pct = avg != null ? (avg / 5) * 100 : 0;
  return (
    <div className="grid grid-cols-[5rem_1fr_3rem] items-center gap-3 text-sm">
      <span className="text-zinc-600 dark:text-zinc-400">{label}</span>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-western-600 dark:bg-western-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-right font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
        {avg != null ? avg.toFixed(1) : "-"}
      </span>
    </div>
  );
}
