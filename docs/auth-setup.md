# Auth setup (email magic link)

WesternScope uses Supabase email OTP / magic links for sign-in. Users enter their `@uwo.ca` email on `/sign-in`, get a one-time link in their Outlook inbox, and click it to finish.

## What's already configured

- **Email provider:** enabled by default in Supabase → Authentication → Providers → Email. No setup needed.
- **Redirect URLs:** set in Supabase → Authentication → URL Configuration:
  - Site URL: `https://westernscope.vercel.app`
  - Additional Redirect URLs: `http://localhost:3000/auth/callback`, `https://westernscope.vercel.app/auth/callback`
- **`@uwo.ca` enforcement:**
  - Client-side in `components/SignInForm.tsx` (UX hint — rejects other domains before sending the email).
  - Server-side in `lib/actions/reviews.ts` (rejects review submissions from non-`@uwo.ca` users).
  - Database-side in `supabase/migrations/0001_init.sql` — the `reviews_insert_own_uwo` RLS policy is the authoritative gate.

Anyone can technically request a magic link, but only `@uwo.ca` users can post reviews.

## Email delivery

Out of the box, Supabase sends magic-link emails from `noreply@mail.supabase.io` on the **free tier rate limit of 2 emails/hour per project**. That's enough to develop and demo, not enough for any real traffic.

When you're ready for real traffic, switch to a real SMTP provider:

1. Sign up for [Resend](https://resend.com) (free tier: 3,000 emails/month, 100/day).
2. Verify a domain you own (use a subdomain like `mail.westernscope.vercel.app` if you don't own a top-level domain yet — actually you'll need to use a real custom domain for this).
3. Supabase → Project Settings → Authentication → SMTP Settings → enable Custom SMTP, paste Resend creds.

Skip this until you actually run out of the free tier.

## Customizing the email

Supabase → Authentication → Email Templates → "Magic Link". The default works fine for v1; tweak the subject/copy whenever it bothers you. The template uses `{{ .ConfirmationURL }}` which will be the URL containing `?code=...&type=magiclink&redirect_to=…/auth/callback?next=…` — don't break that.
