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

export async function listCourses(opts?: { q?: string; limit?: number }): Promise<Course[]> {
  const supabase = await createClient();
  let query = supabase
    .from("courses")
    .select("id, code, title, description, prereqs, faculty, credit_weight")
    .order("code", { ascending: true });

  if (opts?.q) {
    const term = opts.q.trim();
    if (term) {
      const safe = term.replace(/[%,]/g, " ");
      query = query.or(`code.ilike.%${safe}%,title.ilike.%${safe}%`);
    }
  }

  if (opts?.limit) query = query.limit(opts.limit);

  const { data, error } = await query;
  if (error) throw new Error(`listCourses: ${error.message}`);
  return data ?? [];
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
