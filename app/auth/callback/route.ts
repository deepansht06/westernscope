import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { setTwoFactorPassed, sessionIdFromAccessToken } from "@/lib/twofa";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next");
  const next =
    rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // This code came from a verified channel - an email link (signup confirm
      // or password recovery) or an OAuth provider (Google). Proving control of
      // that channel is equivalent to the emailed 2FA step, so mark 2FA
      // satisfied for this session and skip a redundant code.
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const sid = sessionIdFromAccessToken(session?.access_token);
      if (user && sid) await setTwoFactorPassed(user.id, sid);

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/?auth_error=1`);
}
