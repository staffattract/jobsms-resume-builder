import Link from "next/link";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/current-user";

export const metadata: Metadata = {
  title: "AI Resume Builder — Recruiter-ready in minutes",
  description:
    "Build a recruiter-ready resume with AI. ATS-friendly formatting, stronger bullets, instant PDF download.",
};

export const dynamic = "force-dynamic";

const btnPrimary =
  "inline-flex items-center justify-center rounded-xl bg-zinc-900 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-zinc-900/15 transition hover:bg-zinc-800 active:scale-[0.99] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white";
const btnSecondary =
  "inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 py-3.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-900";

export default async function Home() {
  const user = await getCurrentUser();
  const appHref = user ? "/resumes" : "/login";

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-100/95 via-white to-zinc-50/90 font-sans text-zinc-900 antialiased dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-950 dark:text-zinc-50">
      <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Resume builder
          </span>
          <Link
            href={user ? "/resumes" : "/login"}
            className="text-sm font-semibold text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            {user ? "My resumes" : "Sign in"}
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-4 pb-16 pt-14 text-center sm:px-6 sm:pb-20 sm:pt-20">
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-zinc-950 sm:text-5xl md:text-6xl dark:text-zinc-50">
            Stop Getting Ignored by Employers
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 sm:text-xl dark:text-zinc-400">
            Build a recruiter-ready, ATS-friendly resume with AI — then download a
            polished PDF instantly.
          </p>

          {/* Product preview mockup (decorative) */}
          <div
            className="mx-auto mt-12 max-w-4xl text-left"
            aria-hidden
          >
            <div className="rounded-2xl border border-zinc-200/90 bg-zinc-100/90 p-2 shadow-xl shadow-zinc-900/10 ring-1 ring-zinc-900/[0.04] dark:border-zinc-700 dark:bg-zinc-900/50 dark:ring-white/5 sm:p-3">
              <div className="grid gap-2 sm:grid-cols-[minmax(0,34%)_1fr] sm:gap-3">
                {/* Builder panel */}
                <div className="flex flex-col gap-2 rounded-xl border border-zinc-200/80 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-950">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                    Progress
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-2 py-1.5 dark:bg-emerald-950/40">
                      <span className="size-5 shrink-0 rounded-full bg-emerald-600 text-center text-[10px] font-bold leading-5 text-white">
                        ✓
                      </span>
                      <span className="text-[11px] font-medium text-zinc-800 dark:text-zinc-200">
                        Experience
                      </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-zinc-100 px-2 py-1.5 dark:bg-zinc-800/80">
                      <span className="size-5 shrink-0 rounded-full bg-zinc-900 text-center text-[10px] font-bold leading-5 text-white dark:bg-zinc-100 dark:text-zinc-900">
                        2
                      </span>
                      <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                        Summary
                      </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 opacity-60">
                      <span className="size-5 shrink-0 rounded-full border border-zinc-300 text-center text-[10px] font-semibold leading-5 text-zinc-400 dark:border-zinc-600">
                        3
                      </span>
                      <span className="text-[11px] text-zinc-500">Skills</span>
                    </div>
                  </div>
                  <div className="mt-2 rounded-lg border border-zinc-200 bg-zinc-50/80 p-2 dark:border-zinc-700 dark:bg-zinc-900/60">
                    <div className="h-1.5 w-1/3 rounded bg-zinc-200 dark:bg-zinc-700" />
                    <div className="mt-2 h-1.5 w-full rounded bg-zinc-100 dark:bg-zinc-800" />
                    <div className="mt-1.5 h-1.5 w-[84%] rounded bg-zinc-100 dark:bg-zinc-800" />
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    <span className="inline-flex size-4 animate-pulse rounded-full bg-violet-400/80" />
                    <span className="text-[10px] font-medium text-violet-700 dark:text-violet-300">
                      AI refining…
                    </span>
                  </div>
                </div>

                {/* Live preview + paywall hint */}
                <div className="relative min-h-[200px] overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-inner dark:border-zinc-700 dark:bg-zinc-50 sm:min-h-[220px]">
                  <div className="border-b border-zinc-200 px-4 pb-3 pt-4 text-center dark:border-zinc-200">
                    <div className="text-sm font-semibold tracking-tight text-zinc-950">
                      Jordan Lee
                    </div>
                    <div className="mt-1 text-[10px] text-zinc-600">
                      jordan@email.com · San Francisco
                    </div>
                  </div>
                  <div className="space-y-2 px-4 py-3 text-left">
                    <div className="text-[9px] font-semibold uppercase tracking-widest text-zinc-400">
                      Summary
                    </div>
                    <div className="space-y-1">
                      <div className="h-1 w-full rounded bg-zinc-100 dark:bg-zinc-200" />
                      <div className="h-1 w-[92%] rounded bg-zinc-100 dark:bg-zinc-200" />
                      <div className="h-1 w-4/5 rounded bg-zinc-100 dark:bg-zinc-200" />
                    </div>
                    <div className="pt-1 text-[9px] font-semibold uppercase tracking-widest text-zinc-400">
                      Experience
                    </div>
                    <div className="h-1 w-full rounded bg-zinc-100 dark:bg-zinc-200" />
                    <div className="h-1 w-[83%] rounded bg-zinc-100 dark:bg-zinc-200" />
                  </div>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[42%] bg-gradient-to-b from-transparent via-white/70 to-white dark:via-zinc-50/70 dark:to-zinc-50" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[42%] backdrop-blur-[3px]" />
                  <div className="absolute inset-x-0 bottom-0 flex justify-center pb-3 pt-8">
                    <div className="rounded-lg border border-zinc-200/90 bg-white/95 px-3 py-2 text-center shadow-md dark:border-zinc-700 dark:bg-zinc-900/95">
                      <div className="text-[9px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                        Export
                      </div>
                      <div className="mt-0.5 text-[10px] font-semibold text-zinc-800 dark:text-zinc-100">
                        Unlock PDF
                      </div>
                    </div>
                  </div>
                  <div className="absolute right-2 top-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                    Live preview
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
            <Link href={appHref} className={btnPrimary}>
              Start Building Your Resume
            </Link>
            <a href="#pricing" className={btnSecondary}>
              See Pricing
            </a>
          </div>
        </section>

        {/* Pain */}
        <section className="border-y border-zinc-200/80 bg-zinc-50/80 py-16 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
              Applying to jobs but not hearing back?
            </h2>
            <ul className="mx-auto mt-8 max-w-xl space-y-4 text-center text-base text-zinc-700 dark:text-zinc-300">
              <li className="flex items-start justify-center gap-3 sm:items-center">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-zinc-400 sm:mt-0" />
                You apply to dozens of jobs
              </li>
              <li className="flex items-start justify-center gap-3 sm:items-center">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-zinc-400 sm:mt-0" />
                No callbacks or interviews
              </li>
              <li className="flex items-start justify-center gap-3 sm:items-center">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-zinc-400 sm:mt-0" />
                You’re not sure what’s wrong
              </li>
            </ul>
            <p className="mt-10 text-center text-lg font-medium text-zinc-900 dark:text-zinc-100">
              It’s usually your resume — we fix it instantly.
            </p>
          </div>
        </section>

        {/* What you get */}
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
            What you get
          </h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Clean, professional resume",
              "ATS-optimized formatting",
              "Stronger bullet points with AI",
              "Instant PDF download",
            ].map((title) => (
              <div
                key={title}
                className="rounded-2xl border border-zinc-200/90 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <p className="text-sm font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
                  {title}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Product difference */}
        <section className="border-t border-zinc-200/80 bg-white py-16 dark:border-zinc-800 dark:bg-zinc-950 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
              No waiting. No back-and-forth.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-zinc-400">
              Unlike traditional resume services, you don’t wait 48 hours. You get
              a polished, professional resume instantly — and can keep improving it
              anytime.
            </p>
          </div>
        </section>

        {/* Pricing */}
        <section
          id="pricing"
          className="scroll-mt-20 border-t border-zinc-200/80 bg-zinc-50/80 py-16 dark:border-zinc-800 dark:bg-zinc-900/40 sm:py-20"
        >
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
              Simple pricing
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-center text-sm text-zinc-600 dark:text-zinc-400">
              Pay when you’re ready to export. Prices shown for clarity — final
              amount at checkout.
            </p>
            <div className="mt-12 grid gap-6 md:grid-cols-2 md:gap-8">
              <div className="rounded-2xl border border-zinc-200/90 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Download once
                </h3>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  $4.99
                </p>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  Perfect for a single job application
                </p>
                <Link
                  href={appHref}
                  className={`${btnSecondary} mt-8 w-full`}
                >
                  Get started
                </Link>
              </div>
              <div className="relative rounded-2xl border-2 border-emerald-600/90 bg-gradient-to-b from-emerald-50/90 to-white p-8 shadow-lg shadow-emerald-950/10 dark:border-emerald-500 dark:from-emerald-950/40 dark:to-zinc-950">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Best Value
                </span>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Resume Pro
                </h3>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  $9.99<span className="text-lg font-medium text-zinc-600 dark:text-zinc-400">/month</span>
                </p>
                <ul className="mt-5 space-y-2.5 text-sm text-zinc-700 dark:text-zinc-300">
                  <li className="flex gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                    Unlimited PDF downloads
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                    Ongoing edits
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                    AI improvements anytime
                  </li>
                </ul>
                <Link
                  href={appHref}
                  className={`${btnPrimary} mt-8 w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400`}
                >
                  Get Resume Pro
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
            How it works
          </h2>
          <ol className="mx-auto mt-12 max-w-lg space-y-6">
            {[
              "Enter your experience",
              "Let AI improve your content",
              "Preview your resume",
              "Download your professional PDF",
            ].map((step, i) => (
              <li
                key={step}
                className="flex gap-4 rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                  {i + 1}
                </span>
                <span className="pt-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* Guarantee */}
        <section className="border-t border-zinc-200/80 bg-zinc-50/80 py-12 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
            <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
              Try it risk-free. Only pay when you’re ready to download.
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
            Start building your resume now
          </h2>
          <Link href={appHref} className={`${btnPrimary} mt-8 inline-flex px-8 py-4 text-base`}>
            Create My Resume
          </Link>
        </section>

        <footer className="border-t border-zinc-200/80 py-8 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
          <p>© {new Date().getFullYear()} Resume builder</p>
        </footer>
      </main>
    </div>
  );
}
