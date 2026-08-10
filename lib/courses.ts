import { createClient } from "@/lib/supabase/server";

export type Course = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  prereqs: string | null;
  antireqs: string | null;
  extra_info: string | null;
  campuses: string[] | null;
  faculty: string | null;
  credit_weight: number | null;
};

export type CourseWithStats = Course & {
  review_count: number;
  liked_avg: number | null;
  useful_avg: number | null;
  difficulty_avg: number | null;
};

export type CourseSort = "code" | "popular" | "liked";
export type YearLevel = "1" | "2" | "3" | "4";

export type ListCoursesOptions = {
  q?: string;
  yearLevel?: YearLevel;
  sort?: CourseSort;
  hasReviews?: boolean;
  limit?: number;
};

export async function listCourses(
  opts: ListCoursesOptions = {},
): Promise<CourseWithStats[]> {
  const supabase = await createClient();

  // Stats are pre-aggregated by the `course_stats` view (see
  // supabase/migrations/0003_course_stats_view.sql) so we fetch one row per
  // course instead of scanning the entire reviews table on every request.
  //
  // Search/sort/filter happen in JS below, so we need the *whole* catalog in
  // hand. PostgREST caps a single response at 1000 rows, and with ~6.7k courses
  // that silently hid most of them (and broke search for anything past the
  // first page), so we page through with explicit ranges until exhausted.
  const PAGE = 1000;
  const select =
    "id, code, title, description, prereqs, antireqs, extra_info, campuses, faculty, credit_weight, review_count, liked_avg, useful_avg, difficulty_avg";
  type StatsRow = CourseWithStats & { review_count: number | null };
  const data: StatsRow[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data: page, error } = await supabase
      .from("course_stats")
      .select(select)
      .order("code", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) {
      throw new Error(`listCourses: ${error.message}`);
    }
    if (!page || page.length === 0) break;
    data.push(...(page as unknown as StatsRow[]));
    if (page.length < PAGE) break;
  }

  let rows: CourseWithStats[] = data.map((c) => ({
    id: c.id,
    code: c.code,
    title: c.title,
    description: c.description,
    prereqs: c.prereqs,
    antireqs: c.antireqs,
    extra_info: c.extra_info,
    campuses: c.campuses,
    faculty: c.faculty,
    credit_weight: c.credit_weight,
    review_count: c.review_count ?? 0,
    liked_avg: c.liked_avg ?? null,
    useful_avg: c.useful_avg ?? null,
    difficulty_avg: c.difficulty_avg ?? null,
  }));

  if (opts.q) {
    // Split into terms so "data structures" and "cs 2210" both work, and
    // require every term to appear somewhere in code/title/description.
    const terms = opts.q
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    if (terms.length > 0) {
      rows = rows.filter((c) => {
        const haystack = `${c.code} ${c.title} ${c.description ?? ""}`.toLowerCase();
        return terms.every((t) => haystack.includes(t));
      });
    }
  }

  if (opts.yearLevel) {
    rows = rows.filter((c) => {
      const m = c.code.match(/\s(\d)/);
      return !!m && m[1] === opts.yearLevel;
    });
  }

  if (opts.hasReviews) {
    rows = rows.filter((c) => c.review_count > 0);
  }

  const sort: CourseSort = opts.sort ?? "code";
  if (sort === "code") {
    rows.sort((a, b) => a.code.localeCompare(b.code));
  } else if (sort === "popular") {
    rows.sort(
      (a, b) =>
        b.review_count - a.review_count || a.code.localeCompare(b.code),
    );
  } else if (sort === "liked") {
    rows.sort(
      (a, b) =>
        (b.liked_avg ?? -1) - (a.liked_avg ?? -1) ||
        b.review_count - a.review_count ||
        a.code.localeCompare(b.code),
    );
  }

  if (opts.limit) rows = rows.slice(0, opts.limit);

  return rows;
}

export async function getCourseByCode(code: string): Promise<Course | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select(
      "id, code, title, description, prereqs, antireqs, extra_info, campuses, faculty, credit_weight",
    )
    .eq("code", code)
    .maybeSingle();
  if (error) throw new Error(`getCourseByCode: ${error.message}`);
  return data;
}

export async function countCourses(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("courses")
    .select("id", { count: "exact", head: true });
  if (error) throw new Error(`countCourses: ${error.message}`);
  return count ?? 0;
}
