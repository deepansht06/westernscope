"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";

export type AuthResult = {
  ok?: boolean;
  error?: string;
  needsVerification?: boolean;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

/** Best-effort origin of the current request, for email redirect links. */
async function siteOrigin(): Promise<string> {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("host");
  if (host) return `${h.get("x-forwarded-proto") ?? "https"}://${host}`;
  return SITE_URL;
}

export async function signUpWithPassword(
  email: string,
  password: string,
): Promise<AuthResult> {
  const e = email.trim().toLowerCase();
  if (!EMAIL_RE.test(e)) return { error: "Enter a valid email address." };
  if (password.length < MIN_PASSWORD) {
    return { error: `Password must be at least ${MIN_PASSWORD} characters.` };
  }

  const supabase = await createClient();
  const origin = await siteOrigin();
  const { data, error } = await supabase.auth.signUp({
    email: e,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback?next=/` },
  });
  if (error) return { error: error.message };

  // With "Confirm email" enabled, Supabase returns no session until the user
  // clicks the verification link. (An already-registered address also comes
  // back with no session and an obfuscated user, so the UX message is the same
  // either way — which avoids leaking whether an account exists.)
  if (!data.session) return { ok: true, needsVerification: true };
  return { ok: true };
}

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<AuthResult> {
  const e = email.trim().toLowerCase();
  if (!EMAIL_RE.test(e) || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: e,
    password,
  });
  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("not confirmed")) {
      return {
        error: "Verify your email first — check your inbox for the link.",
        needsVerification: true,
      };
    }
    if (msg.includes("invalid login")) {
      return { error: "That email or password doesn't match." };
    }
    return { error: error.message };
  }

  // Success at AAL1. NOTE: the emailed-2FA step-up (B3) will branch here —
  // when the device isn't trusted, we'll issue a code and route to /verify
  // instead of treating the user as fully signed in.
  return { ok: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
