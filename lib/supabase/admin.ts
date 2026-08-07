import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client for server-only work that must bypass RLS —
 * specifically the `email_otp` and `trusted_devices` tables, which have RLS
 * enabled with no policies so no anon/authenticated client can reach them.
 *
 * NEVER import this into a client component or expose the secret key. It uses
 * no session and persists nothing.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error("Supabase admin client: URL or SUPABASE_SECRET_KEY missing");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
