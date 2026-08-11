import "server-only";
import {
  createHash,
  createHmac,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from "crypto";
import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Emailed two-factor auth with "remember this device".
 *
 * Security model:
 *  - Codes are 6 digits, stored only as SHA-256 hashes in `email_otp`, expire
 *    in 10 minutes, and lock after 5 wrong attempts.
 *  - "2FA passed" is an HMAC-signed, httpOnly cookie bound to the current
 *    Supabase session id, so it dies when the session changes (new login).
 *  - "Trusted device" is an opaque 32-byte token in an httpOnly cookie; only
 *    its SHA-256 hash is stored (in `trusted_devices`), so a DB leak yields
 *    nothing usable. Deleting the row revokes the device.
 *  - The service-role client is used for all DB access here (the tables are
 *    RLS-locked away from the user's own client).
 */

const CODE_TTL_MIN = 10;
const MAX_ATTEMPTS = 5;
const PURPOSE = "login_2fa";

export const TWOFA_OK_COOKIE = "ws_2fa";
export const TRUSTED_DEVICE_COOKIE = "ws_dev";
export type RememberDays = 30 | 90;

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "expired" | "locked" | "none" };

// --------------------------------------------------------------------------
// primitives
// --------------------------------------------------------------------------
function secret(): string {
  const s = process.env.TWOFA_SECRET;
  if (!s) throw new Error("TWOFA_SECRET is not set");
  return s;
}

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

function hmac(input: string): string {
  return createHmac("sha256", secret()).update(input).digest("hex");
}

/** Constant-time compare of two hex strings. */
function safeEqualHex(a: string, b: string): boolean {
  const ba = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

function generateCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/** `base64url(json).hmac` - tamper-proof signed cookie value. */
function makeSignedToken(obj: Record<string, unknown>): string {
  const body = Buffer.from(JSON.stringify(obj)).toString("base64url");
  return `${body}.${hmac(body)}`;
}

function readSignedToken(
  token: string | undefined,
): Record<string, unknown> | null {
  if (!token) return null;
  const [body, mac] = token.split(".");
  if (!body || !mac || !safeEqualHex(hmac(body), mac)) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString());
  } catch {
    return null;
  }
}

/** Pull the stable `session_id` claim out of a Supabase access-token JWT. */
export function sessionIdFromAccessToken(
  accessToken: string | undefined | null,
): string | null {
  if (!accessToken) return null;
  try {
    const [, payload] = accessToken.split(".");
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof claims.session_id === "string" ? claims.session_id : null;
  } catch {
    return null;
  }
}

function deviceLabel(ua: string | null): string {
  if (!ua) return "Unknown device";
  const os =
    /Windows/.test(ua) ? "Windows"
    : /Mac OS X|Macintosh/.test(ua) ? "macOS"
    : /Android/.test(ua) ? "Android"
    : /iPhone|iPad|iOS/.test(ua) ? "iOS"
    : /Linux/.test(ua) ? "Linux"
    : "device";
  const browser =
    /Edg\//.test(ua) ? "Edge"
    : /OPR\/|Opera/.test(ua) ? "Opera"
    : /Chrome\//.test(ua) ? "Chrome"
    : /Firefox\//.test(ua) ? "Firefox"
    : /Safari\//.test(ua) ? "Safari"
    : "browser";
  return `${browser} on ${os}`;
}

// --------------------------------------------------------------------------
// email
// --------------------------------------------------------------------------
async function sendCodeEmail(email: string, code: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "WesternScope <onboarding@resend.dev>",
      to: [email],
      subject: `${code} is your WesternScope verification code`,
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;max-width:440px;margin:0 auto;padding:24px">
          <p style="font-size:18px;font-weight:700;color:#4f2683;margin:0 0 16px">WesternScope</p>
          <p style="font-size:15px;color:#27272a;margin:0 0 8px">Your verification code is:</p>
          <p style="font-size:34px;font-weight:800;letter-spacing:6px;color:#4f2683;margin:8px 0 16px">${code}</p>
          <p style="font-size:13px;color:#71717a;margin:0">It expires in ${CODE_TTL_MIN} minutes. If you didn't try to sign in, you can ignore this email.</p>
        </div>`,
    }),
  });
  if (!res.ok) {
    throw new Error(`Resend send failed (${res.status}): ${await res.text()}`);
  }
}

// --------------------------------------------------------------------------
// OTP lifecycle
// --------------------------------------------------------------------------
export async function issueLoginCode(
  userId: string,
  email: string,
): Promise<void> {
  const admin = createAdminClient();
  const code = generateCode();
  const expiresAt = new Date(Date.now() + CODE_TTL_MIN * 60_000).toISOString();

  // Replace any outstanding code for this purpose.
  await admin
    .from("email_otp")
    .delete()
    .eq("user_id", userId)
    .eq("purpose", PURPOSE)
    .is("consumed_at", null);

  const { error } = await admin.from("email_otp").insert({
    user_id: userId,
    code_hash: sha256(code),
    purpose: PURPOSE,
    expires_at: expiresAt,
  });
  if (error) throw new Error(`issueLoginCode: ${error.message}`);

  await sendCodeEmail(email, code);
}

export async function verifyLoginCode(
  userId: string,
  code: string,
): Promise<VerifyResult> {
  const admin = createAdminClient();
  const { data: rows } = await admin
    .from("email_otp")
    .select("id, code_hash, expires_at, attempts")
    .eq("user_id", userId)
    .eq("purpose", PURPOSE)
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1);

  const row = rows?.[0];
  if (!row) return { ok: false, reason: "none" };
  if (new Date(row.expires_at).getTime() < Date.now()) {
    return { ok: false, reason: "expired" };
  }
  if (row.attempts >= MAX_ATTEMPTS) return { ok: false, reason: "locked" };

  if (!safeEqualHex(sha256(code), row.code_hash)) {
    const attempts = row.attempts + 1;
    await admin.from("email_otp").update({ attempts }).eq("id", row.id);
    return { ok: false, reason: attempts >= MAX_ATTEMPTS ? "locked" : "invalid" };
  }

  await admin
    .from("email_otp")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", row.id);
  return { ok: true };
}

// --------------------------------------------------------------------------
// trusted devices
// --------------------------------------------------------------------------
export async function trustThisDevice(
  userId: string,
  days: RememberDays,
): Promise<void> {
  const admin = createAdminClient();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + days * 86_400_000).toISOString();
  const ua = (await headers()).get("user-agent");

  const { error } = await admin.from("trusted_devices").insert({
    user_id: userId,
    token_hash: sha256(token),
    label: deviceLabel(ua),
    expires_at: expiresAt,
  });
  if (error) throw new Error(`trustThisDevice: ${error.message}`);

  (await cookies()).set(TRUSTED_DEVICE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: days * 86_400,
  });
}

async function isDeviceTrusted(userId: string): Promise<boolean> {
  const token = (await cookies()).get(TRUSTED_DEVICE_COOKIE)?.value;
  if (!token) return false;

  const admin = createAdminClient();
  const { data: rows } = await admin
    .from("trusted_devices")
    .select("id, expires_at")
    .eq("user_id", userId)
    .eq("token_hash", sha256(token))
    .limit(1);

  const row = rows?.[0];
  if (!row || new Date(row.expires_at).getTime() < Date.now()) return false;

  await admin
    .from("trusted_devices")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", row.id);
  return true;
}

/** True if this login is trusted so we can skip emailing a code. */
export async function deviceTrustedFor(userId: string): Promise<boolean> {
  return isDeviceTrusted(userId);
}

// --------------------------------------------------------------------------
// "2FA passed" state
// --------------------------------------------------------------------------
export async function setTwoFactorPassed(
  userId: string,
  sessionId: string,
): Promise<void> {
  (await cookies()).set(
    TWOFA_OK_COOKIE,
    makeSignedToken({ uid: userId, sid: sessionId }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 90 * 86_400,
    },
  );
}

export async function clearTwoFactorPassed(): Promise<void> {
  (await cookies()).delete(TWOFA_OK_COOKIE);
}

/**
 * Whether the current request has satisfied 2FA - either the signed cookie is
 * valid for this exact session, or the device is trusted.
 */
async function twoFactorSatisfied(
  userId: string,
  sessionId: string | null,
): Promise<boolean> {
  const cookie = (await cookies()).get(TWOFA_OK_COOKIE)?.value;
  const payload = readSignedToken(cookie);
  if (
    payload &&
    payload.uid === userId &&
    sessionId &&
    payload.sid === sessionId
  ) {
    return true;
  }
  return isDeviceTrusted(userId);
}

/** Convenience gate for pages/actions: resolves the user+session itself. */
export async function twoFactorOk(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return twoFactorSatisfied(user.id, sessionIdFromAccessToken(session?.access_token));
}
