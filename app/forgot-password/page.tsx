import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset your password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Reset your password
      </h1>
      <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
        Enter your email and we&apos;ll send you a link to set a new one.
      </p>
      <div className="mt-6 w-full">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
