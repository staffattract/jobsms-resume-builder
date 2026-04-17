import Link from "next/link";
import type { Metadata } from "next";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Sign in — Resume builder",
  description: "Sign in to edit and export your resumes.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-zinc-950 font-sans text-zinc-100 antialiased">
      <header className="border-b border-zinc-800/90 bg-black/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="text-sm font-semibold text-zinc-400 transition hover:text-white"
          >
            ← Back
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
            Sign in to continue
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-400 sm:text-base">
            Access your resumes, AI writing tools, and PDF downloads — all in one
            place.
          </p>
        </div>

        <div className="mt-8 sm:mt-10">
          <SignInForm />
        </div>

        <p className="mt-6 text-center text-sm leading-relaxed text-zinc-400 sm:text-base">
          New here?{" "}
          <Link
            href="/register"
            className="font-semibold text-zinc-200 underline decoration-zinc-500/80 underline-offset-4 transition hover:text-white hover:decoration-white"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
