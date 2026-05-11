import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — WesternScope",
  description:
    "WesternScope is an independent student-built course review site for Western University.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        About WesternScope
      </h1>

      <div className="mt-8 space-y-8 text-base leading-7 text-zinc-800 dark:text-zinc-200">
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            What this is
          </h2>
          <p className="mt-2">
            WesternScope is a course review site for Western University. It
            exists so Mustangs can read honest, anonymous notes from other
            students before they enrol in a class — what the workload was
            actually like, whether the prof made it click, how much the final
            mattered. It is built and maintained by a Western student in their
            spare time.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            How reviews work
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>
              Only verified <span className="font-medium">@uwo.ca</span>{" "}
              accounts can post reviews.
            </li>
            <li>
              Reviews are shown anonymously. Your name and email are never
              displayed alongside what you write.
            </li>
            <li>
              You can edit or delete your reviews at any time from your{" "}
              <Link
                href="/me"
                className="font-medium text-[#4F2683] hover:underline dark:text-[#A78BFA]"
              >
                My reviews
              </Link>{" "}
              page.
            </li>
            <li>One review per course per person.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Where the course data comes from
          </h2>
          <p className="mt-2">
            Course titles, descriptions, prerequisites, and credit weights are
            sourced from the Western Academic Calendar. We have reached out to
            the Office of the Registrar regarding terms of use and are
            currently awaiting a response; the site will be updated to reflect
            their guidance once received.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Independent project
          </h2>
          <p className="mt-2">
            WesternScope is not affiliated with, endorsed by, or sponsored by
            Western University. It is an independent open-source project.
            Source code lives on{" "}
            <a
              href="https://github.com/deepansht06/westernscope"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[#4F2683] hover:underline dark:text-[#A78BFA]"
            >
              GitHub
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Contact
          </h2>
          <p className="mt-2">
            Found a bug, want a course or faculty added, or have a removal
            request? Open an issue on{" "}
            <a
              href="https://github.com/deepansht06/westernscope/issues"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[#4F2683] hover:underline dark:text-[#A78BFA]"
            >
              GitHub
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
