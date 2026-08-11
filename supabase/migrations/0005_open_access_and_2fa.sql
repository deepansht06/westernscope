-- WesternScope: open the site to everyone + tables for emailed 2FA & trusted devices
-- Run this in Supabase Dashboard → SQL Editor → New query → paste → Run.
--
-- Part of the auth rebuild (see the frontend-redesign initiative):
--   * The site is no longer @uwo.ca-only. Anyone can sign up and review, like
--     uwflow lets non-Waterloo users in. So the reviews INSERT policy drops the
--     email-domain check and just requires ownership. Email verification (that
--     the address is real) is enforced by Supabase's "Confirm email" setting,
--     which prevents an unconfirmed user from getting a session at all.
--   * Emailed 2FA and "remember this device" need server-side state. Both tables
--     have RLS enabled with NO policies, so they are unreachable by the anon /
--     authenticated clients — only the server-side service-role client (which
--     bypasses RLS) touches them.

-- ============================================================================
-- reviews: open INSERT to any authenticated owner (was @uwo.ca-only)
-- ============================================================================
drop policy if exists "reviews_insert_own_uwo" on public.reviews;

create policy "reviews_insert_own"
  on public.reviews for insert
  with check (auth.uid() = user_id);

-- ============================================================================
-- email_otp — one-time codes emailed as the 2nd factor (and future flows)
--   code_hash: SHA-256 of the 6-digit code (never store the code in the clear)
--   purpose:   'login_2fa' for now; leaves room for e.g. 'email_change'
--   attempts:  incremented on each wrong guess so we can lock a code out
-- ============================================================================
create table public.email_otp (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  code_hash    text not null,
  purpose      text not null default 'login_2fa',
  expires_at   timestamptz not null,
  consumed_at  timestamptz,
  attempts     smallint not null default 0,
  created_at   timestamptz not null default now()
);

create index email_otp_user_purpose_idx on public.email_otp (user_id, purpose);
create index email_otp_expires_idx on public.email_otp (expires_at);

alter table public.email_otp enable row level security;
-- No policies: only the service-role server client may read/write these.

-- ============================================================================
-- trusted_devices — "remember this device for 30 / 90 days"
--   token_hash: SHA-256 of the opaque device token stored in a signed,
--               httpOnly cookie on the user's browser. Server compares hashes,
--               so a DB leak never yields a usable token.
--   Deleting a row instantly revokes that device.
-- ============================================================================
create table public.trusted_devices (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  token_hash    text not null unique,
  label         text,                    -- e.g. "Chrome on Windows"
  expires_at    timestamptz not null,
  last_used_at  timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

create index trusted_devices_user_idx on public.trusted_devices (user_id);
create index trusted_devices_expires_idx on public.trusted_devices (expires_at);

alter table public.trusted_devices enable row level security;
-- No policies: only the service-role server client may read/write these.
