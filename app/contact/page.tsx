import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with WesternScope - report a bug, request a course, or ask for a review to be removed.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Contact
      </h1>
      <p className="mt-3 text-base leading-7 text-zinc-600 dark:text-zinc-300">
        Questions, bug reports, course requests, or removals - WesternScope is
        run by a Western student, and every message is read personally. The
        fastest way to reach us is by email.
      </p>

      {/* ---------------------------------------------------------- Methods */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <a
          href="mailto:dthakur5@uwo.ca"
          className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-colors hover:border-[#4F2683]/40 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-[#A78BFA]/40"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4F2683]/10 text-[#4F2683] dark:bg-[#A78BFA]/10 dark:text-[#A78BFA]">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-10 6L2 7" />
            </svg>
          </div>
          <h2 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Email
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Best for anything personal or time-sensitive.
          </p>
          <p className="mt-2 text-sm font-medium text-[#4F2683] group-hover:underline dark:text-[#A78BFA]">
            dthakur5@uwo.ca
          </p>
        </a>

        <a
          href="https://github.com/deepansht06/westernscope/issues"
          target="_blank"
          rel="noreferrer"
          className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-colors hover:border-[#4F2683]/40 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-[#A78BFA]/40"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4F2683]/10 text-[#4F2683] dark:bg-[#A78BFA]/10 dark:text-[#A78BFA]">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
          </div>
          <h2 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            GitHub Issues
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Best for bugs and feature ideas you want tracked in the open.
          </p>
          <p className="mt-2 text-sm font-medium text-[#4F2683] group-hover:underline dark:text-[#A78BFA]">
            Open an issue
          </p>
        </a>
      </div>

      {/* ----------------------------------------------------------- Details */}
      <div className="mt-10 space-y-8 text-base leading-7 text-zinc-800 dark:text-zinc-200">
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            What to reach out about
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>A bug, broken page, or something that looks wrong.</li>
            <li>
              A course that is missing, or catalog info that is out of date.
            </li>
            <li>
              Removing a review you posted, or a takedown request for content.
            </li>
            <li>General feedback, ideas, or just to say hi.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Removals and privacy
          </h2>
          <p className="mt-2">
            Reviews are always shown anonymously, and you can edit or delete your
            own reviews anytime from your{" "}
            <Link
              href="/me"
              className="font-medium text-[#4F2683] hover:underline dark:text-[#A78BFA]"
            >
              My reviews
            </Link>{" "}
            page. If you believe a review is abusive, false, or shares private
            information, email us and we will review it promptly.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Response time
          </h2>
          <p className="mt-2">
            This is a student-run project, so replies usually land within a few
            days. Thanks for your patience - and for helping make WesternScope
            better for everyone.
          </p>
        </section>
      </div>

      <p className="mt-10 text-sm text-zinc-500 dark:text-zinc-400">
        Looking for more background?{" "}
        <Link
          href="/about"
          className="font-medium text-[#4F2683] hover:underline dark:text-[#A78BFA]"
        >
          Read about WesternScope
        </Link>
        .
      </p>
    </div>
  );
}
