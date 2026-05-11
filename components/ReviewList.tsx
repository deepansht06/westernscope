import { listReviewsForCourse, summarizeReviews } from "@/lib/reviews";

export async function ReviewList({ courseId }: { courseId: string }) {
  const reviews = await listReviewsForCourse(courseId);

  if (reviews.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          No reviews yet — be the first.
        </p>
      </div>
    );
  }

  const summary = summarizeReviews(reviews);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Based on {summary.count} {summary.count === 1 ? "review" : "reviews"}
        </div>
        <div className="space-y-2">
          <Bar label="Liked" pct={summary.liked} />
          <Bar label="Useful" pct={summary.useful} />
          <Bar label="Easy" pct={summary.easy} />
        </div>
      </div>
      <ul className="space-y-3">
        {reviews.map((r) => (
          <li
            key={r.id}
            className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {r.liked === true && <Tag color="green">Liked</Tag>}
              {r.liked === false && <Tag color="red">Disliked</Tag>}
              {r.useful === true && <Tag>Useful</Tag>}
              {r.easy === true && <Tag>Easy</Tag>}
              {r.easy === false && <Tag color="amber">Hard</Tag>}
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
          </li>
        ))}
      </ul>
    </div>
  );
}

function Bar({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="grid grid-cols-[5rem_1fr_3rem] items-center gap-3 text-sm">
      <span className="text-zinc-600 dark:text-zinc-400">{label}</span>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-[#4F2683] dark:bg-[#A78BFA]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-right font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
        {pct}%
      </span>
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
