"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SignInButton() {
  const pathname = usePathname();
  const next = encodeURIComponent(pathname || "/");

  return (
    <Link
      href={`/sign-in?next=${next}`}
      className="inline-flex items-center rounded-md bg-[#4F2683] px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-[#3F1F6A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F2683] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
    >
      Sign in
    </Link>
  );
}
