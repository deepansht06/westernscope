import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SignInForm } from "@/components/SignInForm";

export const metadata: Metadata = {
  title: "Sign in — WesternScope",
};

type Props = { searchParams: Promise<{ next?: string }> };

export default async function SignInPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const user = await getCurrentUser();
  if (user) {
    redirect(next && next.startsWith("/") && !next.startsWith("//") ? next : "/");
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Sign in to WesternScope
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Enter your <span className="font-medium">@uwo.ca</span> email and
        we&apos;ll send you a one-time sign-in link.
      </p>
      <div className="mt-6">
        <SignInForm next={next ?? "/"} />
      </div>
    </div>
  );
}
