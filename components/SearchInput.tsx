"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

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
  const inputRef = useRef<HTMLInputElement>(null);

  // Press "/" anywhere to jump to the search box (skip when already typing).
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement;
      const typing =
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable);
      if (typing) return;
      e.preventDefault();
      inputRef.current?.focus();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

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
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            if (value) {
              e.preventDefault();
              setValue("");
            } else {
              inputRef.current?.blur();
            }
          }
        }}
        placeholder={placeholder}
        aria-label="Search courses"
        className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 pr-16 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-[#4F2683] focus:outline-none focus:ring-2 focus:ring-[#4F2683]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500"
      />
      <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
        {isPending && <span className="text-xs text-zinc-400">…</span>}
        {value ? (
          <button
            type="button"
            onClick={() => {
              setValue("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="rounded text-zinc-400 hover:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#4F2683]/20 dark:hover:text-zinc-200"
          >
            <span aria-hidden="true" className="text-lg leading-none">
              ×
            </span>
          </button>
        ) : (
          <kbd className="hidden rounded border border-zinc-300 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 sm:inline-block dark:border-zinc-700">
            /
          </kbd>
        )}
      </div>
    </div>
  );
}
