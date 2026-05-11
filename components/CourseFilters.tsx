"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import type { CourseSort, YearLevel } from "@/lib/courses";

const YEAR_OPTIONS: { value: "" | YearLevel; label: string }[] = [
  { value: "", label: "All" },
  { value: "1", label: "1xxx" },
  { value: "2", label: "2xxx" },
  { value: "3", label: "3xxx" },
  { value: "4", label: "4xxx" },
];

const SORT_OPTIONS: { value: CourseSort; label: string }[] = [
  { value: "code", label: "Course code" },
  { value: "popular", label: "Most reviewed" },
  { value: "liked", label: "Highest rated" },
];

export function CourseFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentYear = (params.get("year") as YearLevel | null) ?? "";
  const currentSort = (params.get("sort") as CourseSort | null) ?? "code";
  const hasReviews = params.get("reviewed") === "1";

  function update(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value === null || value === "") next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    startTransition(() => {
      router.replace(qs ? `/courses?${qs}` : "/courses");
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Year
        </span>
        <div className="flex flex-wrap gap-1">
          {YEAR_OPTIONS.map((opt) => {
            const active = currentYear === opt.value;
            return (
              <button
                key={opt.value || "all"}
                type="button"
                onClick={() => update("year", opt.value || null)}
                className={
                  active
                    ? "rounded-md bg-[#4F2683] px-2.5 py-1 text-xs font-medium text-white dark:bg-[#A78BFA] dark:text-zinc-950"
                    : "rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600"
                }
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <label className="flex items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Sort
        </span>
        <select
          value={currentSort}
          onChange={(e) => update("sort", e.target.value === "code" ? null : e.target.value)}
          className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 focus:border-[#4F2683] focus:outline-none focus:ring-1 focus:ring-[#4F2683] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={hasReviews}
          onChange={(e) => update("reviewed", e.target.checked ? "1" : null)}
          className="h-4 w-4 rounded border-zinc-300 text-[#4F2683] focus:ring-[#4F2683] dark:border-zinc-700 dark:bg-zinc-900"
        />
        <span className="text-zinc-700 dark:text-zinc-300">Has reviews</span>
      </label>

      {isPending && (
        <span className="text-xs text-zinc-400">updating…</span>
      )}
    </div>
  );
}
