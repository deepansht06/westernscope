import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Set a new password",
};

export default async function ResetPasswordPage() {
  // The recovery email link runs through /auth/callback, which establishes a
  // session before landing here. No session means the link was invalid/expired.
  const user = await getCurrentUser();

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Set a new password
      </h1>

      {user ? (
        <>
          <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Choose a new password for{" "}
            <span className="font-medium text-zinc-800 dark:text-zinc-200">
              {user.email}
            </span>
            .
          </p>
          <div className="mt-6 w-full">
            <ResetPasswordForm />
          </div>
        </>
      ) : (
        <div className="mt-6 w-full max-w-sm rounded-2xl border border-black/5 bg-white p-6 text-center shadow-xl shadow-black/10 dark:border-white/10 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            This reset link is invalid or has expired.
          </p>
          <Link
            href="/forgot-password"
            className="mt-4 inline-block text-sm font-semibold text-western-600 hover:underline dark:text-western-300"
          >
            Request a new link
          </Link>
        </div>
      )}
    </div>
  );
}
