import Link from "next/link";
import type { Metadata } from "next";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
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
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Reset your password
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-400 sm:text-base">
            Enter the email for your account. We&apos;ll email you a one-time link
            that expires in one hour.
          </p>
        </div>

        <div className="mt-8 sm:mt-10">
          <ForgotPasswordForm />
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Wrong place?{" "}
          <Link
            href="/forgot-email"
            className="font-medium text-zinc-400 underline-offset-4 transition hover:text-zinc-200 hover:underline"
          >
            Forgot which email you used?
          </Link>
        </p>
      </div>
    </div>
  );
}
