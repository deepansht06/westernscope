"use client";

import { useState } from "react";

/**
 * Landing-page login / signup card (uwflow-style).
 *
 * NOTE: this is the UI shell only. The real auth wiring — Supabase
 * email+password, Google OAuth, and the emailed 2FA / remember-device flow —
 * lands in the auth phase. For now submitting shows an inline "coming soon"
 * notice so the card is demoable without a dead-end.
 */
type Mode = "login" | "signup";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-western-600 focus:outline-none focus:ring-2 focus:ring-western-600/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500";

export function AuthCard() {
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const isSignup = mode === "signup";

  function switchMode(next: Mode) {
    setMode(next);
    setNotice(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNotice(
      isSignup
        ? "Accounts are almost ready — sign-up goes live here shortly."
        : "Secure email + password login is being set up — it'll be live here shortly.",
    );
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-black/5 bg-white p-6 shadow-2xl shadow-black/25 dark:border-white/10 dark:bg-zinc-900">
      {/* Tabs */}
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
        {(["login", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => switchMode(m)}
            className={
              mode === m
                ? "rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-zinc-50"
                : "rounded-md px-3 py-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }
          >
            {m === "login" ? "Log in" : "Sign up"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Email
          </label>
          <input type="email" required placeholder="you@example.com" className={inputClass} />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Password
            </label>
            {!isSignup && (
              <button
                type="button"
                onClick={() => setNotice("Password reset will be available once accounts are live.")}
                className="text-xs font-medium text-western-600 hover:underline dark:text-western-300"
              >
                Forgot?
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder={isSignup ? "Create a password" : "Your password"}
              className={`${inputClass} pr-14`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {isSignup && (
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Confirm password
            </label>
            <input type="password" required placeholder="Re-enter password" className={inputClass} />
          </div>
        )}

        <button
          type="submit"
          className="w-full rounded-lg bg-western-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-western-700 focus:outline-none focus:ring-2 focus:ring-western-600/40"
        >
          {isSignup ? "Create account" : "Log in"}
        </button>
      </form>

      <div className="my-4 flex items-center gap-3">
        <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        <span className="text-xs font-medium text-zinc-400">OR</span>
        <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <button
        type="button"
        onClick={() => setNotice("Google sign-in is being connected — hang tight.")}
        className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      {notice && (
        <p className="mt-4 rounded-lg bg-western-50 px-3 py-2 text-center text-xs text-western-700 dark:bg-western-950/60 dark:text-western-200">
          {notice}
        </p>
      )}

      <p className="mt-5 text-center text-sm text-zinc-500 dark:text-zinc-400">
        {isSignup ? "Already have an account?" : "New to WesternScope?"}{" "}
        <button
          type="button"
          onClick={() => switchMode(isSignup ? "login" : "signup")}
          className="font-semibold text-western-600 hover:underline dark:text-western-300"
        >
          {isSignup ? "Log in" : "Create one"}
        </button>
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}
