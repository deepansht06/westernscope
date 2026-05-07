import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export function isUwoEmail(email: string | null | undefined): boolean {
  return !!email && email.toLowerCase().endsWith("@uwo.ca");
}
