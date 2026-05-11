-- WesternScope: add tag chips to reviews
-- Run this in Supabase Dashboard → SQL Editor → New query → paste → Run.

-- Tags are a small fixed enum stored as a text[] for flexibility (a user
-- can pick zero or more). The CHECK constraint enforces the allowed set
-- at the DB layer; the app also validates client-side and in the server
-- action.

alter table public.reviews
  add column if not exists tags text[] not null default '{}';

alter table public.reviews
  drop constraint if exists reviews_tags_valid;

alter table public.reviews
  add constraint reviews_tags_valid check (
    tags <@ array[
      'group_work',
      'attendance',
      'final_heavy',
      'lots_of_readings',
      'tough_grader',
      'many_assignments'
    ]::text[]
  );
