"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { resendTwoFactorCode, verifyTwoFactor } from "@/lib/actions/auth";
import type { RememberDays } from "@/lib/twofa";

export function VerifyForm({ next }: { next: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [remember, setRemember] = useState(true);
  const [days, setDays] = useState<RememberDays>(30);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const res = await verifyTwoFactor(code, remember, days);
      if (res.error) {
        setError(res.error);
        return;
      }
      router.push(next.startsWith("/") ? next : "/");
      router.refresh();
    });
  }

  function handleResend() {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const res = await resendTwoFactorCode();
      if (res.error) setError(res.error);
      else setNotice("A fresh code is on its way.");
    });
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-black/5 bg-white p-6 shadow-xl shadow-black/10 dark:border-white/10 dark:bg-zinc-900">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            6-digit code
          </label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="••••••"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-center font-mono text-2xl tracking-[0.4em] text-zinc-900 placeholder:text-zinc-300 focus:border-western-600 focus:outline-none focus:ring-2 focus:ring-western-600/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-600"
          />
        </div>

        <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-western-600 focus:ring-western-600 dark:border-zinc-700 dark:bg-zinc-900"
            />
            Remember this device
          </label>
          {remember && (
            <div className="mt-2 flex gap-1">
              {([30, 90] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDays(d)}
                  className={
                    days === d
                      ? "rounded-md bg-western-600 px-2.5 py-1 text-xs font-medium text-white"
                      : "rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400"
                  }
                >
                  {d} days
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={pending || code.length !== 6}
          className="w-full rounded-lg bg-western-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-western-700 focus:outline-none focus:ring-2 focus:ring-western-600/40 disabled:opacity-60"
        >
          {pending ? "Verifying…" : "Verify and continue"}
        </button>
      </form>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-center text-xs text-red-700 dark:bg-red-950/60 dark:text-red-300">
          {error}
        </p>
      )}
      {notice && !error && (
        <p className="mt-4 rounded-lg bg-western-50 px-3 py-2 text-center text-xs text-western-700 dark:bg-western-950/60 dark:text-western-200">
          {notice}
        </p>
      )}

      <p className="mt-5 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Didn&apos;t get it?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={pending}
          className="font-semibold text-western-600 hover:underline disabled:opacity-60 dark:text-western-300"
        >
          Resend code
        </button>
      </p>
    </div>
  );
}
