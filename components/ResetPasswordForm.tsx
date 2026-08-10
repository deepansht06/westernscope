"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePassword } from "@/lib/actions/auth";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-western-600 focus:outline-none focus:ring-2 focus:ring-western-600/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    startTransition(async () => {
      const res = await updatePassword(password);
      if (res.error) {
        setError(res.error);
        return;
      }
      setDone(true);
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1200);
    });
  }

  if (done) {
    return (
      <div className="w-full max-w-sm rounded-2xl border border-black/5 bg-white p-6 text-center shadow-xl shadow-black/10 dark:border-white/10 dark:bg-zinc-900">
        <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Password updated
        </p>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Taking you back to WesternScope...
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm rounded-2xl border border-black/5 bg-white p-6 shadow-xl shadow-black/10 dark:border-white/10 dark:bg-zinc-900"
    >
      <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
        New password
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          className={`${inputClass} pr-14`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>

      <label className="mb-1 mt-3 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
        Confirm new password
      </label>
      <input
        type="password"
        required
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="Re-enter password"
        className={inputClass}
      />

      <button
        type="submit"
        disabled={pending}
        className="mt-4 w-full rounded-lg bg-western-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-western-700 focus:outline-none focus:ring-2 focus:ring-western-600/40 disabled:opacity-60"
      >
        {pending ? "Updating..." : "Update password"}
      </button>
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-center text-xs text-red-700 dark:bg-red-950/60 dark:text-red-300">
          {error}
        </p>
      )}
    </form>
  );
}
