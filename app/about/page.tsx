import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "WesternScope is an independent student-built course review site for Western University.",
  alternates: { canonical: "/about" },
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
            students before they enrol in a class - what the workload was
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
              Anyone can create a free account with a verified email and post
              reviews.
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
            Course titles, descriptions, prerequisites, antirequisites, credit
            weights, and campus availability come from an official export of the
            Western Academic Calendar, provided directly by Western&rsquo;s
            Office of the Registrar. The catalog currently covers roughly 6,700
            courses across the Main, Huron, and King&rsquo;s campuses.
          </p>
          <p className="mt-2">
            Calendar data can change between terms. If you spot something out of
            date or missing, let us know on the{" "}
            <Link
              href="/contact"
              className="font-medium text-[#4F2683] hover:underline dark:text-[#A78BFA]"
            >
              contact page
            </Link>{" "}
            and we will get it corrected.
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
            Found a bug, want a course added, or have a removal request? Head to
            the{" "}
            <Link
              href="/contact"
              className="font-medium text-[#4F2683] hover:underline dark:text-[#A78BFA]"
            >
              contact page
            </Link>{" "}
            or email{" "}
            <a
              href="mailto:dthakur5@uwo.ca"
              className="font-medium text-[#4F2683] hover:underline dark:text-[#A78BFA]"
            >
              dthakur5@uwo.ca
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
