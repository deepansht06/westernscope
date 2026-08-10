import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { twoFactorOk } from "@/lib/twofa";
import { VerifyForm } from "@/components/VerifyForm";

export const metadata: Metadata = {
  title: "Verify it's you",
};

type Props = { searchParams: Promise<{ next?: string }> };

function safePath(next: string | undefined): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export default async function VerifyPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const dest = safePath(next);

  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(dest)}`);
  // Already verified (or trusted device) - nothing to do here.
  if (await twoFactorOk()) redirect(dest);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Verify it&apos;s you
      </h1>
      <p className="mt-2 max-w-sm text-center text-sm text-zinc-600 dark:text-zinc-400">
        We emailed a 6-digit code to{" "}
        <span className="font-medium text-zinc-800 dark:text-zinc-200">
          {user.email}
        </span>
        . Enter it below to finish signing in.
      </p>
      <div className="mt-6 w-full">
        <VerifyForm next={dest} />
      </div>
    </div>
  );
}
