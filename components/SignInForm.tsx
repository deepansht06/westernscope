"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export function SignInForm({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const trimmed = email.trim().toLowerCase();
    if (!trimmed.endsWith("@uwo.ca")) {
      setError("Use your @uwo.ca email address.");
      return;
    }

    const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

    setPending(true);
    const supabase = createClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`,
      },
    });
    setPending(false);

    if (otpError) {
      setError(otpError.message);
      return;
    }
    setSentTo(trimmed);
  }

  if (sentTo) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6 text-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p className="font-medium text-zinc-900 dark:text-zinc-50">
          Check your inbox.
        </p>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          We sent a sign-in link to{" "}
          <span className="font-medium">{sentTo}</span>. Click it to finish
          signing in.
        </p>
        <button
          type="button"
          onClick={() => setSentTo(null)}
          className="mt-3 text-xs font-medium text-[#4F2683] hover:underline dark:text-[#A78BFA]"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label
          htmlFor="signin-email"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Email
        </label>
        <input
          id="signin-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@uwo.ca"
          className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#4F2683] focus:outline-none focus:ring-1 focus:ring-[#4F2683] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-md bg-[#4F2683] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#3F1F6A] disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send sign-in link"}
      </button>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </form>
  );
}
