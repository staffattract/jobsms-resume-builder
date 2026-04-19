import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PublicFooter } from "@/components/marketing/PublicFooter";
import { logoutAction } from "@/lib/auth/form-actions";
import { getCurrentUser } from "@/lib/auth/current-user";
import { VerifyEmailClient } from "./verify-email-client";

export const metadata: Metadata = {
  title: "Check your email — Resume builder",
  robots: { index: false, follow: false },
};

export default async function VerifyEmailPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (user.emailVerifiedAt) {
    redirect("/resumes");
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-black via-zinc-950 to-zinc-950 font-sans text-zinc-100 antialiased">
      <header className="border-b border-zinc-800/90 bg-black/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="text-sm font-semibold text-zinc-400 transition hover:text-white"
          >
            ← Home
          </Link>
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-white transition hover:text-zinc-200"
          >
            Resume builder
          </Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-12 sm:px-6 sm:py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Check your email
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-400 sm:text-base">
            We sent you a confirmation link to activate your account.
          </p>
          <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-zinc-500 sm:text-sm">
            Didn&apos;t see it? Check your spam or promotions folder.
          </p>
          <p className="mx-auto mt-2 max-w-md text-xs text-zinc-500 sm:text-sm">
            Sent to <span className="font-medium text-zinc-400">{user.email}</span>
          </p>
        </div>

        <div className="mt-8 sm:mt-10">
          <VerifyEmailClient />
        </div>

        <p className="mt-8 text-center text-xs text-zinc-500">
          Wrong account?{" "}
          <form action={logoutAction} className="inline">
            <button
              type="submit"
              className="font-semibold text-zinc-300 underline decoration-zinc-600 underline-offset-4 transition hover:text-white hover:decoration-zinc-400"
            >
              Sign out
            </button>
          </form>
        </p>
      </div>

      <PublicFooter />
    </div>
  );
}
