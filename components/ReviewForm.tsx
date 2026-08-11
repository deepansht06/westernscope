"use client";

import { useActionState, useEffect, useState } from "react";
import { submitReview, type ReviewFormState } from "@/lib/actions/reviews";
import { REVIEW_TAGS } from "@/lib/tags";

type Existing = {
  text: string | null;
  liked: number | null;
  useful: number | null;
  difficulty: number | null;
  tags: string[];
} | null;

type Props = {
  courseId: string;
  courseSlug: string;
  existing: Existing;
  onSaved?: () => void;
};

const SCALES = [
  { name: "liked", label: "Liked it?", low: "Not for me", high: "Loved it" },
  { name: "useful", label: "Useful?", low: "Not useful", high: "Very useful" },
  { name: "difficulty", label: "Difficulty?", low: "Very easy", high: "Very hard" },
] as const;

export function ReviewForm({ courseId, courseSlug, existing, onSaved }: Props) {
  const [state, action, pending] = useActionState<
    ReviewFormState | undefined,
    FormData
  >(submitReview, undefined);

  useEffect(() => {
    if (state?.ok && onSaved) onSaved();
  }, [state, onSaved]);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="course_id" value={courseId} />
      <input type="hidden" name="course_slug" value={courseSlug} />

      <div className="grid gap-5 sm:grid-cols-3">
        {SCALES.map((s) => (
          <Scale
            key={s.name}
            name={s.name}
            label={s.label}
            low={s.low}
            high={s.high}
            defaultValue={existing?.[s.name] ?? null}
          />
        ))}
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Tags (optional)
        </legend>
        <div className="flex flex-wrap gap-2">
          {REVIEW_TAGS.map((tag) => (
            <TagChip
              key={tag.value}
              value={tag.value}
              label={tag.label}
              defaultChecked={existing?.tags?.includes(tag.value) ?? false}
            />
          ))}
        </div>
      </fieldset>

      <div>
        <label
          htmlFor="review-text"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Review (optional)
        </label>
        <textarea
          id="review-text"
          name="text"
          rows={5}
          maxLength={2000}
          defaultValue={existing?.text ?? ""}
          placeholder="What did you think? Workload, profs, what helped you do well…"
          className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-western-600 focus:outline-none focus:ring-1 focus:ring-western-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Reviews are shown anonymously. Your name and email are never displayed.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center rounded-md bg-western-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-western-700 disabled:opacity-50"
        >
          {pending ? "Saving…" : existing ? "Update review" : "Post review"}
        </button>
        {state?.error && (
          <span className="text-sm text-red-600 dark:text-red-400">
            {state.error}
          </span>
        )}
        {state?.ok && (
          <span className="text-sm text-green-700 dark:text-green-400">
            Saved.
          </span>
        )}
      </div>
    </form>
  );
}

/** 1-5 rating: five rounded, selectable rectangles. Click again to clear. */
function Scale({
  name,
  label,
  low,
  high,
  defaultValue,
}: {
  name: string;
  label: string;
  low: string;
  high: string;
  defaultValue: number | null;
}) {
  const [value, setValue] = useState<number | null>(defaultValue);

  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </legend>
      {/* The value the server reads; empty string = skipped. */}
      <input type="hidden" name={name} value={value ?? ""} />
      <div className="flex gap-1.5" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => {
          const active = value === n;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${label} ${n} of 5`}
              onClick={() => setValue((v) => (v === n ? null : n))}
              className={
                "flex h-10 flex-1 items-center justify-center rounded-lg border text-sm font-semibold transition-colors " +
                (active
                  ? "border-western-600 bg-western-600 text-white shadow-sm"
                  : "border-zinc-300 bg-white text-zinc-600 hover:border-western-400 hover:text-western-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-western-400")
              }
            >
              {n}
            </button>
          );
        })}
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-zinc-400 dark:text-zinc-500">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </fieldset>
  );
}

function TagChip({
  value,
  label,
  defaultChecked,
}: {
  value: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="cursor-pointer">
      <input
        type="checkbox"
        name="tags"
        value={value}
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <span className="inline-block rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 hover:border-zinc-400 peer-checked:border-western-600 peer-checked:bg-western-600 peer-checked:text-white dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:peer-checked:border-western-400 dark:peer-checked:bg-western-500 dark:peer-checked:text-white">
        {label}
      </span>
    </label>
  );
}
