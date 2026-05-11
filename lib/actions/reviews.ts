"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isUwoEmail } from "@/lib/auth";
import { isReviewTag } from "@/lib/tags";

export type ReviewFormState = {
  ok?: boolean;
  error?: string;
};

function parseTriad(v: FormDataEntryValue | null): boolean | null {
  if (v === "yes") return true;
  if (v === "no") return false;
  return null;
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
  if (!isUwoEmail(user.email)) {
    return { error: "Only @uwo.ca accounts can post reviews." };
  }

  const text = ((formData.get("text") as string | null) ?? "").trim();
  const liked = parseTriad(formData.get("liked"));
  const useful = parseTriad(formData.get("useful"));
  const easy = parseTriad(formData.get("easy"));
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
    easy === null &&
    tags.length === 0
  ) {
    return { error: "Add at least a thumbs rating, a tag, or some text." };
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
      easy,
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
