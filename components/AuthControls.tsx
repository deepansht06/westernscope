import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { SignInButton } from "./SignInButton";
import { SignOutButton } from "./SignOutButton";

export async function AuthControls() {
  const user = await getCurrentUser();

  if (!user) {
    return <SignInButton />;
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/me"
        className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        My reviews
      </Link>
      <span className="hidden text-xs text-zinc-500 dark:text-zinc-400 sm:inline">
        {user.email}
      </span>
      <SignOutButton />
    </div>
  );
}
