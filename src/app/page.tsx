import Link from "next/link";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { PublicFooter } from "@/components/marketing/PublicFooter";
import { HomeHeroCtas } from "@/components/landing/HomeHeroCtas";
import { recordAnalyticsEvent } from "@/lib/analytics/record-event";
import { getCurrentUser } from "@/lib/auth/current-user";

export const metadata: Metadata = {
  title: "AI Resume Builder — Recruiter-ready in minutes",
  description:
    "Build a recruiter-ready resume with AI. Start for $1 today, download instantly, then $9.99/month after 10 days — cancel anytime.",
};

export const dynamic = "force-dynamic";

const btnPrimary =
  "inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-black/25 transition hover:bg-zinc-200 active:scale-[0.99]";
const btnSecondary =
  "inline-flex items-center justify-center rounded-xl border border-zinc-600 bg-transparent px-6 py-3.5 text-sm font-semibold text-zinc-100 transition hover:border-zinc-400 hover:bg-zinc-900/80";

function CheckRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-3.5">
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/15 text-xs font-bold text-emerald-400">
        ✓
      </span>
      <p className="text-[15px] font-medium leading-snug text-zinc-200">{children}</p>
    </div>
  );
}

export default async function Home() {
  const user = await getCurrentUser();
  await recordAnalyticsEvent({
    type: "PAGE_VIEW_HOME",
    userId: user?.id ?? null,
  });
  const appHref =
    user && !user.emailVerifiedAt
      ? "/verify-email"
      : user
        ? "/resumes"
        : "/register";

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 font-sans text-zinc-100 antialiased">
      <header className="border-b border-zinc-800/90 bg-black/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <span className="text-sm font-semibold tracking-tight text-white">
            Resume builder
          </span>
          <div className="flex items-center gap-4">
            {user ? (
              <Link
                href={appHref}
                className="text-sm font-semibold text-zinc-400 transition hover:text-white"
              >
                {user.emailVerifiedAt ? "My resumes" : "Verify email"}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-zinc-300 transition hover:text-zinc-100"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg border border-zinc-600 bg-zinc-900/50 px-3 py-1.5 text-sm font-semibold text-zinc-100 shadow-sm shadow-black/20 transition hover:border-zinc-500 hover:bg-zinc-800/70"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="border-b border-zinc-800/80 bg-gradient-to-b from-black via-zinc-950 to-zinc-950 px-4 pb-10 pt-10 text-center sm:px-6 sm:pb-12 sm:pt-12">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-[3.25rem]">
              Stop Getting Ignored by Employers
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-zinc-400 sm:mt-5 sm:text-lg">
              Build a recruiter-ready, ATS-friendly resume with AI — then download a
              polished PDF instantly. Start for $1 today; $9.99/month after 10 days.
              Cancel anytime.
            </p>

            <div className="mx-auto mt-8 max-w-4xl text-left" aria-hidden>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-2 shadow-2xl shadow-black/40 ring-1 ring-white/[0.06] sm:p-2.5">
                <div className="grid gap-2 sm:grid-cols-[minmax(0,34%)_1fr] sm:gap-2.5">
                  <div className="flex flex-col gap-2 rounded-xl border border-zinc-700/80 bg-zinc-950 p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                      Progress
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-1.5">
                        <span className="size-5 shrink-0 rounded-full bg-emerald-500 text-center text-[10px] font-bold leading-5 text-zinc-950">
                          ✓
                        </span>
                        <span className="text-[11px] font-medium text-zinc-200">
                          Experience
                        </span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-zinc-900 px-2 py-1.5 ring-1 ring-zinc-700">
                        <span className="size-5 shrink-0 rounded-full bg-white text-center text-[10px] font-bold leading-5 text-zinc-950">
                          2
                        </span>
                        <span className="text-[11px] font-medium text-zinc-300">
                          Summary
                        </span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 opacity-50">
                        <span className="size-5 shrink-0 rounded-full border border-zinc-600 text-center text-[10px] font-semibold leading-5 text-zinc-500">
                          3
                        </span>
                        <span className="text-[11px] text-zinc-500">Skills</span>
                      </div>
                    </div>
                    <div className="mt-2 rounded-lg border border-zinc-800 bg-black/40 p-2">
                      <div className="h-1.5 w-1/3 rounded bg-zinc-700" />
                      <div className="mt-2 h-1.5 w-full rounded bg-zinc-800" />
                      <div className="mt-1.5 h-1.5 w-[84%] rounded bg-zinc-800" />
                    </div>
                    <div className="mt-2 flex items-center gap-1">
                      <span className="inline-flex size-4 animate-pulse rounded-full bg-violet-500/70" />
                      <span className="text-[10px] font-medium text-violet-300">
                        AI refining…
                      </span>
                    </div>
                  </div>

                  <div className="relative min-h-[188px] overflow-hidden rounded-xl border border-zinc-700/80 bg-zinc-100 sm:min-h-[200px]">
                    <div className="border-b border-zinc-200 px-4 pb-2.5 pt-3 text-center">
                      <div className="text-sm font-semibold tracking-tight text-zinc-950">
                        Jordan Lee
                      </div>
                      <div className="mt-0.5 text-[10px] text-zinc-600">
                        jordan@email.com · San Francisco
                      </div>
                    </div>
                    <div className="space-y-1.5 px-4 py-2.5 text-left">
                      <div className="text-[9px] font-semibold uppercase tracking-widest text-zinc-400">
                        Summary
                      </div>
                      <div className="space-y-1">
                        <div className="h-1 w-full rounded bg-zinc-200" />
                        <div className="h-1 w-[92%] rounded bg-zinc-200" />
                        <div className="h-1 w-4/5 rounded bg-zinc-200" />
                      </div>
                      <div className="pt-0.5 text-[9px] font-semibold uppercase tracking-widest text-zinc-400">
                        Experience
                      </div>
                      <div className="h-1 w-full rounded bg-zinc-200" />
                      <div className="h-1 w-[83%] rounded bg-zinc-200" />
                    </div>
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[40%] bg-gradient-to-b from-transparent via-zinc-100/80 to-zinc-100" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[40%] backdrop-blur-[2px]" />
                    <div className="absolute inset-x-0 bottom-0 flex justify-center pb-2.5 pt-6">
                      <div className="rounded-lg border border-zinc-200 bg-white/95 px-2.5 py-1.5 text-center shadow-lg">
                        <div className="text-[8px] font-bold uppercase tracking-wider text-amber-800">
                          Export
                        </div>
                        <div className="text-[10px] font-semibold text-zinc-900">
                          $1 trial
                        </div>
                      </div>
                    </div>
                    <div className="absolute right-2 top-2 rounded-full bg-emerald-600/90 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white">
                      Live preview
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <HomeHeroCtas
              appHref={appHref}
              btnPrimary={btnPrimary}
              btnSecondary={btnSecondary}
            />
            <p className="mt-5 text-center text-base text-zinc-300 sm:text-lg">
              Start for $1 today. Download instantly. Then $9.99/month after 10 days —
              cancel anytime.
            </p>
          </div>
        </section>

        {/* Pain → conversion block */}
        <section className="border-b border-zinc-800 bg-black px-4 py-8 sm:px-6 sm:py-9">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/50 ring-1 ring-white/[0.04]">
            <div className="grid gap-8 p-6 sm:gap-10 sm:p-8 md:grid-cols-[1fr_1.05fr] md:items-center md:gap-12 md:p-10">
              <div className="text-left">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                  The silent killer
                </p>
                <h2 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl md:text-[2rem]">
                  Applying nonstop — and still no replies?
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  Recruiters skim in seconds. If your resume doesn’t signal fit
                  instantly, you’re out — before anyone reads a word.
                </p>
              </div>
              <div className="space-y-4 rounded-xl border border-zinc-800/90 bg-black/50 p-5 sm:p-6">
                <CheckRow>You blast applications into the void week after week.</CheckRow>
                <CheckRow>Your inbox stays quiet — no screens, no callbacks.</CheckRow>
                <CheckRow>You tweak wording but never know what actually broke.</CheckRow>
              </div>
            </div>
            <div className="border-t border-zinc-800 bg-zinc-950/80 px-6 py-4 text-center sm:px-10 sm:py-5">
              <p className="text-base font-semibold text-white sm:text-lg">
                Nine times out of ten, it’s the resume — not you.{" "}
                <span className="text-zinc-300">We fix it in minutes, not weeks.</span>
              </p>
            </div>
          </div>
        </section>

        {/* What you get */}
        <section className="border-b border-zinc-800 bg-zinc-950 px-4 py-9 sm:px-6 sm:py-10">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
              What you get
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-center text-sm text-zinc-500">
              Everything you need to look credible, pass ATS, and ship a PDF.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
              {[
                "Clean, professional resume",
                "ATS-optimized formatting",
                "Stronger bullet points with AI",
                "Instant PDF download",
              ].map((title) => (
                <div
                  key={title}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-4 text-center shadow-md shadow-black/20"
                >
                  <p className="text-sm font-semibold leading-snug text-zinc-100">
                    {title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Product difference */}
        <section className="border-b border-zinc-800 bg-black px-4 py-9 sm:px-6 sm:py-10">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              No waiting. No back-and-forth.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              Unlike traditional resume services, you don’t wait 48 hours. You get a
              polished, professional resume instantly — and can keep improving it
              anytime.
            </p>
          </div>
        </section>

        {/* Pricing */}
        <section
          id="pricing"
          className="scroll-mt-16 border-b border-zinc-800 bg-zinc-950 px-4 py-9 sm:px-6 sm:py-10"
        >
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Simple pricing
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed text-zinc-400">
              Start your $1 trial — $1 today, then $9.99/month after 10 days. Cancel
              anytime.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-[1.15fr_0.85fr] md:items-stretch md:gap-6">
              <div className="relative order-1 rounded-2xl border-2 border-emerald-500/80 bg-gradient-to-b from-emerald-950/50 to-zinc-900 p-6 shadow-xl shadow-emerald-950/20 sm:p-7">
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-950">
                  Most popular
                </span>
                <h3 className="text-lg font-semibold text-white">Resume Pro</h3>
                <p className="mt-2 text-3xl font-bold tracking-tight text-white">
                  $1<span className="text-lg font-semibold text-zinc-400"> today</span>
                </p>
                <p className="mt-1 text-sm font-medium text-zinc-300">
                  Then $9.99/month after 10 days · Cancel anytime
                </p>
                <ul className="mt-5 space-y-2 text-sm text-zinc-300">
                  <li className="flex gap-2">
                    <span className="text-emerald-400">✓</span>
                    Download instantly after checkout
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-400">✓</span>
                    Unlimited PDFs while subscribed
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-400">✓</span>
                    Ongoing edits &amp; AI improvements
                  </li>
                </ul>
              </div>
              <div className="order-2 rounded-2xl border border-zinc-800/90 bg-zinc-900/60 p-5 shadow-md sm:p-6">
                <h3 className="text-sm font-semibold text-zinc-400">Single PDF only</h3>
                <p className="mt-2 text-2xl font-bold tracking-tight text-zinc-200">
                  $4.99
                </p>
                <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                  One export, no subscription. Available at checkout if you prefer not to
                  subscribe.
                </p>
              </div>
            </div>

            <div className="mx-auto mt-8 flex max-w-md flex-col items-center sm:mt-9">
              <Link
                href="/register"
                className={`${btnPrimary} w-full px-8 py-4 text-base font-semibold shadow-xl shadow-black/35 sm:w-auto sm:min-w-[280px]`}
              >
                Start your $1 trial
              </Link>
              <p className="mt-2.5 max-w-lg text-center text-[13px] leading-snug text-zinc-200 sm:text-sm">
                $1 today, then $9.99/month after 10 days. Cancel anytime.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-b border-zinc-800 bg-black px-4 py-9 sm:px-6 sm:py-10">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
              How it works
            </h2>
            <ol className="mx-auto mt-7 max-w-lg space-y-3">
              {[
                "Enter your experience",
                "Let AI improve your content",
                "Preview your resume",
                "Download your professional PDF",
              ].map((step, i) => (
                <li
                  key={step}
                  className="flex gap-3 rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-3.5"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-zinc-950">
                    {i + 1}
                  </span>
                  <span className="pt-0.5 text-sm font-medium text-zinc-200">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Guarantee */}
        <section className="border-b border-zinc-800 bg-zinc-950 px-4 py-7 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-base font-semibold text-zinc-100 sm:text-lg">
              Download instantly after checkout. $1 today, then $9.99/month after 10 days
              — cancel anytime.
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-black px-4 py-9 text-center sm:px-6 sm:py-10">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Start building your resume now
          </h2>
          <Link
            href={appHref}
            className={`${btnPrimary} mt-6 inline-flex px-8 py-3.5 text-base font-semibold`}
          >
            Create My Resume
          </Link>
        </section>

        <PublicFooter />
      </main>
    </div>
  );
}
