import { createClient } from "@/lib/supabase/server";

export type Review = {
  id: string;
  user_id: string;
  course_id: string;
  liked: boolean | null;
  useful: boolean | null;
  easy: boolean | null;
  text: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type ReviewSummary = {
  count: number;
  liked: number;
  useful: number;
  easy: number;
};

export type MyReview = Review & {
  course: { code: string; title: string };
};

export async function listReviewsForCourse(courseId: string): Promise<Review[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(
      "id, user_id, course_id, liked, useful, easy, text, tags, created_at, updated_at",
    )
    .eq("course_id", courseId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`listReviewsForCourse: ${error.message}`);
  return data ?? [];
}

export async function getMyReviewForCourse(
  courseId: string,
  userId: string,
): Promise<Review | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(
      "id, user_id, course_id, liked, useful, easy, text, tags, created_at, updated_at",
    )
    .eq("course_id", courseId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(`getMyReviewForCourse: ${error.message}`);
  return data;
}

export async function listMyReviews(userId: string): Promise<MyReview[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(
      "id, user_id, course_id, liked, useful, easy, text, tags, created_at, updated_at, courses(code, title)",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`listMyReviews: ${error.message}`);
  return (data ?? []).map((r) => {
    const courseRel = r.courses as unknown as
      | { code: string; title: string }
      | { code: string; title: string }[]
      | null;
    const course = Array.isArray(courseRel) ? courseRel[0] : courseRel;
    return {
      id: r.id,
      user_id: r.user_id,
      course_id: r.course_id,
      liked: r.liked,
      useful: r.useful,
      easy: r.easy,
      text: r.text,
      tags: Array.isArray(r.tags) ? r.tags : [],
      created_at: r.created_at,
      updated_at: r.updated_at,
      course: { code: course?.code ?? "", title: course?.title ?? "" },
    };
  });
}

export async function countReviews(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("reviews")
    .select("id", { count: "exact", head: true });
  if (error) throw new Error(`countReviews: ${error.message}`);
  return count ?? 0;
}

export type TagCount = { tag: string; count: number };

export function summarizeTags(reviews: Review[]): TagCount[] {
  const counts = new Map<string, number>();
  for (const r of reviews) {
    for (const t of r.tags) {
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export function summarizeReviews(reviews: Review[]): ReviewSummary {
  const pct = (key: "liked" | "useful" | "easy") => {
    const total = reviews.filter((r) => r[key] !== null).length;
    if (total === 0) return 0;
    const yes = reviews.filter((r) => r[key] === true).length;
    return Math.round((yes / total) * 100);
  };
  return {
    count: reviews.length,
    liked: pct("liked"),
    useful: pct("useful"),
    easy: pct("easy"),
  };
}
