-- WesternScope initial schema
-- Run this in Supabase Dashboard → SQL Editor → New query → paste → Run.
--
-- Design notes:
--   * Reviews are publicly anonymous: text and ratings are public, user_id is private.
--   * @uwo.ca enforcement is belt-and-suspenders: primary defense is the Google OAuth
--     domain restriction (configured in Auth settings); the RLS policy below is the backup.
--   * RLS is enabled on every table. Public catalog tables (courses, professors, course_professors)
--     are world-readable. Reviews are world-readable but write-restricted to their owner.

-- ============================================================================
-- profiles — extends auth.users
-- ============================================================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users can read and update only their own profile.
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row when a new auth.users row is inserted.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- courses — the Western course catalog (populated by the scraper)
-- ============================================================================
create table public.courses (
  id              uuid primary key default gen_random_uuid(),
  code            text unique not null,                       -- e.g., "CS 1027A"
  title           text not null,
  description     text,
  prereqs         text,                                       -- plain text from the calendar
  faculty         text,                                       -- e.g., "Science"
  credit_weight   numeric(2,1),                               -- 0.5 or 1.0
  created_at      timestamptz not null default now()
);

create index courses_code_idx on public.courses (code);

alter table public.courses enable row level security;

-- Anyone (signed in or not) can browse the catalog.
create policy "courses_select_public"
  on public.courses for select
  using (true);

-- Writes only via service_role (the scraper) — no policy means no public write access.

-- ============================================================================
-- professors
-- ============================================================================
create table public.professors (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  department  text,
  created_at  timestamptz not null default now(),
  unique (name, department)
);

alter table public.professors enable row level security;

create policy "professors_select_public"
  on public.professors for select
  using (true);

-- ============================================================================
-- course_professors — m2m link table (which profs have taught which course)
-- ============================================================================
create table public.course_professors (
  course_id     uuid not null references public.courses(id) on delete cascade,
  professor_id  uuid not null references public.professors(id) on delete cascade,
  primary key (course_id, professor_id)
);

create index course_professors_professor_idx on public.course_professors (professor_id);

alter table public.course_professors enable row level security;

create policy "course_professors_select_public"
  on public.course_professors for select
  using (true);

-- ============================================================================
-- reviews — user reviews of courses (uwflow-style: liked / useful / easy thumbs)
-- ============================================================================
create table public.reviews (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  course_id     uuid not null references public.courses(id) on delete cascade,
  professor_id  uuid references public.professors(id) on delete set null,  -- optional tag
  liked         boolean,                                      -- thumbs up/down, nullable if skipped
  useful        boolean,
  easy          boolean,
  text          text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, course_id)                                 -- one review per user per course
);

create index reviews_course_idx on public.reviews (course_id);
create index reviews_user_idx on public.reviews (user_id);

alter table public.reviews enable row level security;

-- Reviews are publicly readable (anonymously — the UI must NOT join user_id to display names).
create policy "reviews_select_public"
  on public.reviews for select
  using (true);

-- Insert: must be authenticated, the row's user_id must match the caller, AND email must be @uwo.ca.
create policy "reviews_insert_own_uwo"
  on public.reviews for insert
  with check (
    auth.uid() = user_id
    and (auth.jwt() ->> 'email') ilike '%@uwo.ca'
  );

-- Update: only the author can edit, and they can't change ownership.
create policy "reviews_update_own"
  on public.reviews for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Delete: only the author can delete.
create policy "reviews_delete_own"
  on public.reviews for delete
  using (auth.uid() = user_id);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger reviews_set_updated_at
  before update on public.reviews
  for each row execute procedure public.set_updated_at();
