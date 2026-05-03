"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export function SearchInput({
  defaultValue = "",
  placeholder = "Search by course code or title…",
  basePath = "/courses",
}: {
  defaultValue?: string;
  placeholder?: string;
  basePath?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(defaultValue);
  const [isPending, startTransition] = useTransition();

  // Debounce navigation so we don't fire on every keystroke.
  useEffect(() => {
    const trimmed = value.trim();
    const current = params.get("q") ?? "";
    if (trimmed === current) return;

    const timer = setTimeout(() => {
      const search = new URLSearchParams(params.toString());
      if (trimmed) search.set("q", trimmed);
      else search.delete("q");
      const qs = search.toString();
      startTransition(() => {
        router.replace(qs ? `${basePath}?${qs}` : basePath);
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [value, params, router, basePath]);

  return (
    <div className="relative">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-[#4F2683] focus:outline-none focus:ring-2 focus:ring-[#4F2683]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500"
      />
      {isPending && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
          …
        </span>
      )}
    </div>
  );
}
