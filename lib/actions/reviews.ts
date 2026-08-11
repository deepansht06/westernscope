"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { twoFactorOk } from "@/lib/twofa";
import { isReviewTag } from "@/lib/tags";

export type ReviewFormState = {
  ok?: boolean;
  error?: string;
};

function parseRating(v: FormDataEntryValue | null): number | null {
  if (typeof v !== "string") return null;
  const n = Number.parseInt(v, 10);
  return n >= 1 && n <= 5 ? n : null;
}

export async function submitReview(
  _prev: ReviewFormState | undefined,
  formData: FormData,
): Promise<ReviewFormState> {
  const courseId = formData.get("course_id");
  const courseSlug = formData.get("course_slug");
  if (typeof courseId !== "string" || typeof courseSlug !== "string") {
    return { error: "Missing course." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to sign in to post a review." };
  if (!(await twoFactorOk())) {
    return { error: "Finish verifying your login before posting a review." };
  }

  const text = ((formData.get("text") as string | null) ?? "").trim();
  const liked = parseRating(formData.get("liked"));
  const useful = parseRating(formData.get("useful"));
  const difficulty = parseRating(formData.get("difficulty"));
  const tags = Array.from(
    new Set(
      formData
        .getAll("tags")
        .filter((v): v is string => typeof v === "string")
        .filter(isReviewTag),
    ),
  );

  if (
    !text &&
    liked === null &&
    useful === null &&
    difficulty === null &&
    tags.length === 0
  ) {
    return { error: "Add at least a rating, a tag, or some text." };
  }
  if (text.length > 2000) {
    return { error: "Review is too long (max 2000 characters)." };
  }

  const { error } = await supabase.from("reviews").upsert(
    {
      user_id: user.id,
      course_id: courseId,
      text: text || null,
      liked,
      useful,
      difficulty,
      tags,
    },
    { onConflict: "user_id,course_id" },
  );

  if (error) return { error: error.message };

  revalidatePath(`/courses/${courseSlug}`);
  return { ok: true };
}

export async function deleteReview(formData: FormData): Promise<void> {
  const courseId = formData.get("course_id");
  if (typeof courseId !== "string") return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  if (!(await twoFactorOk())) return;

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("user_id", user.id)
    .eq("course_id", courseId);
  if (error) throw new Error(`deleteReview: ${error.message}`);

  revalidatePath("/me");
  const courseSlug = formData.get("course_slug");
  if (typeof courseSlug === "string") {
    revalidatePath(`/courses/${courseSlug}`);
  }
}
