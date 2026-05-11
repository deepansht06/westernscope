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

  const [coursesRes, reviewsRes] = await Promise.all([
    supabase
      .from("courses")
      .select("id, code, title, description, prereqs, faculty, credit_weight"),
    supabase.from("reviews").select("course_id, liked"),
  ]);
  if (coursesRes.error) {
    throw new Error(`listCourses(courses): ${coursesRes.error.message}`);
  }
  if (reviewsRes.error) {
    throw new Error(`listCourses(reviews): ${reviewsRes.error.message}`);
  }

  type Agg = { count: number; likedTotal: number; likedYes: number };
  const statsByCourse = new Map<string, Agg>();
  for (const r of reviewsRes.data ?? []) {
    const s = statsByCourse.get(r.course_id) ?? {
      count: 0,
      likedTotal: 0,
      likedYes: 0,
    };
    s.count++;
    if (r.liked !== null) {
      s.likedTotal++;
      if (r.liked) s.likedYes++;
    }
    statsByCourse.set(r.course_id, s);
  }

  let rows: CourseWithStats[] = (coursesRes.data ?? []).map((c) => {
    const s = statsByCourse.get(c.id);
    return {
      ...c,
      review_count: s?.count ?? 0,
      liked_pct:
        s && s.likedTotal > 0
          ? Math.round((s.likedYes / s.likedTotal) * 100)
          : null,
    };
  });

  if (opts.q) {
    const term = opts.q.trim().toLowerCase();
    if (term) {
      rows = rows.filter(
        (c) =>
          c.code.toLowerCase().includes(term) ||
          c.title.toLowerCase().includes(term),
      );
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
