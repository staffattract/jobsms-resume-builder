import { Suspense } from "react";
import type { Metadata } from "next";
import { BuildPageHeader } from "@/components/resume/BuildPageHeader";
import { PublicResumeBuilderClient } from "@/components/resume/PublicResumeBuilderClient";
import { getCurrentUser } from "@/lib/auth/current-user";

export const metadata: Metadata = {
  title: "Build your resume",
  description:
    "Guided interview for resumeblues.com — one question at a time, with AI and preview. No sign-in. Saved in your browser; PDF export for signed-in customers.",
};

export default async function BuildPage() {
  const user = await getCurrentUser();
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-100/80 to-zinc-50/50 font-sans text-zinc-900 antialiased dark:from-zinc-950 dark:to-zinc-950 dark:text-zinc-100">
      <BuildPageHeader user={user ? { email: user.email } : null} />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <Suspense
          fallback={
            <p className="py-20 text-center text-sm text-zinc-500">Loading…</p>
          }
        >
          <PublicResumeBuilderClient isLoggedIn={user !== null} />
        </Suspense>
      </div>
    </div>
  );
}
