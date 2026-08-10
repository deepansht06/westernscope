-- WesternScope: move reviews from yes/no thumbs to 1-5 rating scales
-- Run this in Supabase Dashboard → SQL Editor → New query → paste → Run.
--
-- DEPLOY TOGETHER: this reshapes columns the live site reads (liked/useful/easy
-- booleans and the course_stats.liked_pct column). Apply this and deploy the
-- matching code together — there's a brief window where an old build is out of
-- sync with the new schema.
--
-- Changes:
--   * liked / useful: boolean -> smallint 1..5 (5 = best)
--   * easy -> difficulty: boolean -> smallint 1..5 (5 = hardest). Inverted on
--     migrate: old easy=true means "easy" -> difficulty 1; easy=false -> 5.
--   * course_stats now exposes per-dimension averages instead of liked_pct.

-- The view depends on these columns, so drop it before altering types.
drop view if exists public.course_stats;

alter table public.reviews
  alter column liked type smallint
    using (case when liked then 5 when liked = false then 1 else null end),
  alter column useful type smallint
    using (case when useful then 5 when useful = false then 1 else null end);

alter table public.reviews rename column easy to difficulty;
alter table public.reviews
  alter column difficulty type smallint
    using (case when difficulty then 1 when difficulty = false then 5 else null end);

alter table public.reviews
  add constraint reviews_liked_range check (liked between 1 and 5),
  add constraint reviews_useful_range check (useful between 1 and 5),
  add constraint reviews_difficulty_range check (difficulty between 1 and 5);

-- Recreate the stats view with averages (security_invoker + grants as before).
create view public.course_stats
with (security_invoker = true)
as
select
  c.id,
  c.code,
  c.title,
  c.description,
  c.prereqs,
  c.antireqs,
  c.extra_info,
  c.campuses,
  c.faculty,
  c.credit_weight,
  count(r.id)::int as review_count,
  round(avg(r.liked)::numeric, 1) as liked_avg,
  round(avg(r.useful)::numeric, 1) as useful_avg,
  round(avg(r.difficulty)::numeric, 1) as difficulty_avg
from public.courses c
left join public.reviews r on r.course_id = c.id
group by c.id;

grant select on public.course_stats to anon, authenticated;
