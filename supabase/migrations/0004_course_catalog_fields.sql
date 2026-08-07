-- WesternScope: widen credit_weight and add catalog fields from the registrar export
-- Run this in Supabase Dashboard → SQL Editor → New query → paste → Run.
--
-- DEPLOY ORDER (important — same lesson as 0003):
--   1. Apply THIS migration in Supabase first.
--   2. Run scraper/import_courses_xlsx.py to load the export.
--   3. Deploy the app code that selects these new columns.
-- Applying it out of order breaks the live site, because the new column
-- references in course_stats / getCourseByCode won't exist yet.
--
-- Why:
--   * The registrar export from Western (Andrew Pocock, Aug 2026) carries fields
--     the calendar scraper never had: antirequisites, "extra information"
--     (lecture/lab hours), and which campuses offer the course.
--   * Its credit weights include 0.25 and 0.75, which the original
--     numeric(2,1) column (max 9.9, one decimal) cannot store.

-- ----------------------------------------------------------------------------
-- Widen credit_weight so 0.25 / 0.75 fit. numeric(3,2) holds 0.00–9.99.
-- ----------------------------------------------------------------------------
alter table public.courses
  alter column credit_weight type numeric(3,2);

-- ----------------------------------------------------------------------------
-- New catalog fields.
--   antireqs   — plain text, prefix stripped (mirrors how prereqs is stored)
--   extra_info — e.g. "3 lecture hours, 1 laboratory hour."
--   campuses   — which campuses offer it, e.g. {Main,Huron,King's}
-- ----------------------------------------------------------------------------
alter table public.courses
  add column if not exists antireqs   text,
  add column if not exists extra_info text,
  add column if not exists campuses   text[];

-- ----------------------------------------------------------------------------
-- Recreate course_stats to expose the new columns (create-or-replace can't add
-- columns to an existing view without a matching column list, so we widen the
-- select). security_invoker + grants preserved from 0003.
-- ----------------------------------------------------------------------------
create or replace view public.course_stats
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
  case
    when count(r.liked) > 0
    then round(100.0 * count(*) filter (where r.liked) / count(r.liked))::int
    else null
  end as liked_pct
from public.courses c
left join public.reviews r on r.course_id = c.id
group by c.id;

grant select on public.course_stats to anon, authenticated;
