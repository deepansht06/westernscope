import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthCard } from "@/components/AuthCard";

export const metadata: Metadata = {
  title: "Sign in",
};

type Props = { searchParams: Promise<{ next?: string }> };

function safePath(next: string | undefined): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export default async function SignInPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(safePath(next));

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Welcome to{" "}
        <span className="text-western-600 dark:text-western-300">WesternScope</span>
      </h1>
      <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
        Log in or create a free account to write reviews. Browsing is always open.
      </p>
      <div className="mt-6 w-full">
        <AuthCard next={safePath(next)} />
      </div>
    </div>
  );
}
