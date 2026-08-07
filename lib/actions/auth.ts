"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";
import {
  issueLoginCode,
  verifyLoginCode,
  deviceTrustedFor,
  trustThisDevice,
  setTwoFactorPassed,
  clearTwoFactorPassed,
  sessionIdFromAccessToken,
  type RememberDays,
} from "@/lib/twofa";

export type AuthResult = {
  ok?: boolean;
  error?: string;
  needsVerification?: boolean;
  needs2fa?: boolean;
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
  const { data, error } = await supabase.auth.signInWithPassword({
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

  // Password is correct (AAL1). Step up with emailed 2FA unless this device is
  // already trusted.
  const user = data.user;
  if (!user) return { ok: true };
  const sessionId = sessionIdFromAccessToken(data.session?.access_token);

  if (await deviceTrustedFor(user.id)) {
    if (sessionId) await setTwoFactorPassed(user.id, sessionId);
    return { ok: true };
  }

  try {
    await issueLoginCode(user.id, user.email ?? e);
  } catch {
    return {
      error: "Couldn't send your verification code — please try again.",
    };
  }
  return { needs2fa: true };
}

export async function verifyTwoFactor(
  code: string,
  remember: boolean,
  rememberDays: RememberDays,
): Promise<AuthResult> {
  const clean = code.replace(/\D/g, "");
  if (clean.length !== 6) return { error: "Enter the 6-digit code." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired — please log in again." };

  const result = await verifyLoginCode(user.id, clean);
  if (!result.ok) {
    const messages: Record<typeof result.reason, string> = {
      invalid: "That code isn't right. Try again.",
      expired: "That code expired — request a new one.",
      locked: "Too many attempts — request a new code.",
      none: "No active code — request a new one.",
    };
    return { error: messages[result.reason] };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const sessionId = sessionIdFromAccessToken(session?.access_token);
  if (sessionId) await setTwoFactorPassed(user.id, sessionId);
  if (remember) await trustThisDevice(user.id, rememberDays);

  return { ok: true };
}

export async function resendTwoFactorCode(): Promise<AuthResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired — please log in again." };

  try {
    await issueLoginCode(user.id, user.email ?? "");
  } catch {
    return { error: "Couldn't resend the code — try again shortly." };
  }
  return { ok: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  await clearTwoFactorPassed();
  revalidatePath("/", "layout");
  redirect("/");
}
