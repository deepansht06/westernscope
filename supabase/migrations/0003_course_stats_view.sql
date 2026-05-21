-- WesternScope: pre-aggregated course review stats
-- Run this in Supabase Dashboard → SQL Editor → New query → paste → Run.
--
-- Why: listCourses() previously fetched every row from `reviews` and
-- aggregated counts in JS on each request. As the review table grows that
-- becomes an unbounded full-table read on every page load. This view pushes
-- the aggregation into Postgres so the app fetches one already-summarized
-- row per course.
--
-- security_invoker = true makes the view honor the *querying role's* RLS on
-- the underlying tables (Postgres 15+). Both `courses` and `reviews` are
-- world-readable (select policy `using (true)`), and the view exposes only
-- aggregate counts -- never user_id -- so anonymous browsing stays safe and
-- reviewer identity stays private.

create or replace view public.course_stats
with (security_invoker = true)
as
select
  c.id,
  c.code,
  c.title,
  c.description,
  c.prereqs,
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

-- Match the grants on the underlying public catalog tables so anonymous and
-- signed-in users can read the aggregated stats.
grant select on public.course_stats to anon, authenticated;
