import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot email?",
  robots: { index: false, follow: false },
};

export default function ForgotEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-zinc-950 font-sans text-zinc-100 antialiased">
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

      <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-lg flex-col justify-center px-4 py-12 sm:px-6 sm:py-16">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 text-center shadow-2xl shadow-black/40 ring-1 ring-white/[0.05] sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Forgot which email you used?
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-zinc-400">
            We can&apos;t look up your account without the email address you signed
            up with. Try the inbox where you usually receive app mail, or sign up
            again if you no longer have access.
          </p>
          <p className="mt-6 text-sm">
            <Link
              href="/register"
              className="font-semibold text-zinc-200 underline-offset-4 transition hover:text-white hover:underline"
            >
              Create a new account
            </Link>
            <span className="mx-2 text-zinc-600">·</span>
            <Link
              href="/forgot-password"
              className="font-semibold text-zinc-200 underline-offset-4 transition hover:text-white hover:underline"
            >
              Try password reset
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
