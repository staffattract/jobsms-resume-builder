import Link from "next/link";
import type { Metadata } from "next";
import { PublicFooter } from "@/components/marketing/PublicFooter";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Set new password",
  robots: { index: false, follow: false },
};

type SearchParams = { token?: string | string[] };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const raw = sp.token;
  const token = typeof raw === "string" ? raw.trim() : "";

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-black via-zinc-950 to-zinc-950 font-sans text-zinc-100 antialiased">
      <header className="border-b border-zinc-800/90 bg-black/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/login"
            className="text-sm font-semibold text-zinc-400 transition hover:text-white"
          >
            ← Sign in
          </Link>
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-white"
          >
            Resume builder
          </Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-12 sm:px-6 sm:py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Choose a new password
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-400 sm:text-base">
            Use a strong password you haven&apos;t used elsewhere.
          </p>
        </div>

        <div className="mt-8 sm:mt-10">
          {token ? (
            <ResetPasswordForm token={token} />
          ) : (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 text-center text-sm text-zinc-400 sm:p-8">
              <p>This reset link is missing a token.</p>
              <p className="mt-4">
                <Link
                  href="/forgot-password"
                  className="font-semibold text-zinc-200 underline-offset-4 transition hover:text-white hover:underline"
                >
                  Request a new link
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
