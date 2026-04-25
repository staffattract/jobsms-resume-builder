import type { Metadata } from "next";
import { PublicResumeBuilderClient } from "@/components/resume/PublicResumeBuilderClient";

export const metadata: Metadata = {
  title: "Build your resume",
  description:
    "Start from scratch with AI or upload an existing resume — no sign-in required. Your work stays in this browser until you are ready to export or save.",
};

export default function BuildPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-100/80 to-zinc-50/50 font-sans text-zinc-900 antialiased dark:from-zinc-950 dark:to-zinc-950 dark:text-zinc-100">
      <header className="border-b border-zinc-200/90 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            ResumeBlues
          </span>
          <a
            href="/"
            className="text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Home
          </a>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <PublicResumeBuilderClient />
      </div>
    </div>
  );
}
