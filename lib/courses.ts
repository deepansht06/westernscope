import { createClient } from "@/lib/supabase/server";

export type Course = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  prereqs: string | null;
  faculty: string | null;
  credit_weight: number | null;
};

export type CourseWithStats = Course & {
  review_count: number;
  liked_pct: number | null;
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
  const { data, error } = await supabase
    .from("course_stats")
    .select(
      "id, code, title, description, prereqs, faculty, credit_weight, review_count, liked_pct",
    );
  if (error) {
    throw new Error(`listCourses: ${error.message}`);
  }

  let rows: CourseWithStats[] = (data ?? []).map((c) => ({
    id: c.id,
    code: c.code,
    title: c.title,
    description: c.description,
    prereqs: c.prereqs,
    faculty: c.faculty,
    credit_weight: c.credit_weight,
    review_count: c.review_count ?? 0,
    liked_pct: c.liked_pct ?? null,
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
        (b.liked_pct ?? -1) - (a.liked_pct ?? -1) ||
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
    .select("id, code, title, description, prereqs, faculty, credit_weight")
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
