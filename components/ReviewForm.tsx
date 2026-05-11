"use client";

import { useActionState } from "react";
import { submitReview, type ReviewFormState } from "@/lib/actions/reviews";
import { REVIEW_TAGS } from "@/lib/tags";

type Existing = {
  text: string | null;
  liked: boolean | null;
  useful: boolean | null;
  easy: boolean | null;
  tags: string[];
} | null;

type Props = {
  courseId: string;
  courseSlug: string;
  existing: Existing;
};

export function ReviewForm({ courseId, courseSlug, existing }: Props) {
  const [state, action, pending] = useActionState<
    ReviewFormState | undefined,
    FormData
  >(submitReview, undefined);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="course_id" value={courseId} />
      <input type="hidden" name="course_slug" value={courseSlug} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Triad name="liked" label="Liked it?" defaultValue={existing?.liked} />
        <Triad name="useful" label="Useful?" defaultValue={existing?.useful} />
        <Triad name="easy" label="Easy?" defaultValue={existing?.easy} />
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
          className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#4F2683] focus:outline-none focus:ring-1 focus:ring-[#4F2683] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Reviews are shown anonymously. Your name and email are never displayed.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center rounded-md bg-[#4F2683] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#3F1F6A] disabled:opacity-50"
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

function Triad({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: boolean | null | undefined;
}) {
  const current =
    defaultValue === true ? "yes" : defaultValue === false ? "no" : "";
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </legend>
      <div
        role="radiogroup"
        className="flex overflow-hidden rounded-md border border-zinc-300 dark:border-zinc-700"
      >
        <Option name={name} value="yes" label="Yes" defaultChecked={current === "yes"} />
        <Option name={name} value="no" label="No" defaultChecked={current === "no"} />
        <Option name={name} value="" label="Skip" defaultChecked={current === ""} />
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
      <span className="inline-block rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 hover:border-zinc-400 peer-checked:border-[#4F2683] peer-checked:bg-[#4F2683] peer-checked:text-white dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:peer-checked:border-[#A78BFA] dark:peer-checked:bg-[#A78BFA] dark:peer-checked:text-zinc-950">
        {label}
      </span>
    </label>
  );
}

function Option({
  name,
  value,
  label,
  defaultChecked,
}: {
  name: string;
  value: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex-1 cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <span className="block border-l border-zinc-300 px-3 py-1.5 text-center text-sm text-zinc-600 first:border-l-0 hover:bg-zinc-50 peer-checked:bg-[#4F2683] peer-checked:text-white peer-focus:ring-1 peer-focus:ring-[#4F2683] dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900">
        {label}
      </span>
    </label>
  );
}
