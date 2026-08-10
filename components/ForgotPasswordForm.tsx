"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/actions/auth";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-western-600 focus:outline-none focus:ring-2 focus:ring-western-600/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await requestPasswordReset(email);
      if (res.error) {
        setError(res.error);
        return;
      }
      setSent(true);
    });
  }

  if (sent) {
    return (
      <div className="w-full max-w-sm rounded-2xl border border-black/5 bg-white p-6 text-center shadow-xl shadow-black/10 dark:border-white/10 dark:bg-zinc-900">
        <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Check your email
        </p>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          If an account exists for{" "}
          <span className="font-medium text-zinc-800 dark:text-zinc-200">
            {email.trim()}
          </span>
          , we sent a link to reset your password.
        </p>
        <Link
          href="/sign-in"
          className="mt-5 inline-block text-sm font-semibold text-western-600 hover:underline dark:text-western-300"
        >
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm rounded-2xl border border-black/5 bg-white p-6 shadow-xl shadow-black/10 dark:border-white/10 dark:bg-zinc-900"
    >
      <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
        Email
      </label>
      <input
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className={inputClass}
      />
      <button
        type="submit"
        disabled={pending}
        className="mt-4 w-full rounded-lg bg-western-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-western-700 focus:outline-none focus:ring-2 focus:ring-western-600/40 disabled:opacity-60"
      >
        {pending ? "Sending..." : "Send reset link"}
      </button>
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-center text-xs text-red-700 dark:bg-red-950/60 dark:text-red-300">
          {error}
        </p>
      )}
      <p className="mt-5 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Remembered it?{" "}
        <Link
          href="/sign-in"
          className="font-semibold text-western-600 hover:underline dark:text-western-300"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
