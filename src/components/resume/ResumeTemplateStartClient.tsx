"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ResumeLivePreview } from "@/components/resume/ResumeLivePreview";
import {
  applyAiRecommendedResumeTemplate,
  selectResumeTemplate,
} from "@/lib/resume/actions";
import {
  MOCK_RESUME_TITLE,
  mockResumeContentForTemplate,
} from "@/lib/resume/templates/mock-resume";
import { RESUME_TEMPLATES } from "@/lib/resume/templates/registry";

function TemplateMiniPreview({ templateId }: { templateId: string }) {
  const content = useMemo(
    () => mockResumeContentForTemplate(templateId),
    [templateId],
  );
  return (
    <div className="relative h-[280px] overflow-hidden rounded-t-xl border border-b-0 border-zinc-200/90 bg-zinc-100/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] dark:border-zinc-800 dark:bg-zinc-900/50 dark:shadow-none">
      <div
        className="pointer-events-none absolute left-1/2 top-3 w-[700px] max-w-[none] -translate-x-1/2 origin-top scale-[0.4] sm:top-4 sm:scale-[0.42]"
        aria-hidden
      >
        <div className="rounded-lg border border-zinc-200/90 bg-white shadow-md ring-1 ring-zinc-900/[0.04] dark:border-zinc-700 dark:bg-zinc-50 dark:ring-zinc-900/10">
          <ResumeLivePreview
            content={content}
            title={MOCK_RESUME_TITLE}
            exportAccess="allowed"
            previewMode="gallery"
          />
        </div>
      </div>
    </div>
  );
}

const cardBase =
  "group flex w-full flex-col rounded-2xl border border-zinc-200/90 bg-white/95 p-6 text-left shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950/90 dark:hover:border-zinc-600 sm:p-7";

const btnPrimary =
  "inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-zinc-900/20 transition hover:bg-zinc-800 active:scale-[0.99] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white";

type Mode = "pick" | "change";

type Props = {
  resumeId: string;
  mode: Mode;
};

export function ResumeTemplateStartClient({ resumeId, mode }: Props) {
  const [phase, setPhase] = useState<"intro" | "gallery">(
    mode === "change" ? "gallery" : "intro",
  );
  const changeOnly = mode === "change";

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          {mode === "change" ? "Change template" : "Choose a template"}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-base">
          {mode === "change"
            ? "Switch layouts anytime — your content stays exactly the same."
            : "Pick a look for your resume. You can change it later in one click."}
        </p>
      </div>

      {phase === "intro" ? (
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
          <form action={applyAiRecommendedResumeTemplate}>
            <input type="hidden" name="resumeId" value={resumeId} />
            <button type="submit" className={cardBase}>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-500">
                Recommended
              </span>
              <span className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                AI Choose for Me
              </span>
              <span className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                We&apos;ll pick the best template based on your resume and goals.
              </span>
              <span className="mt-5 text-sm font-semibold text-emerald-700 group-hover:underline dark:text-emerald-400">
                Use AI pick →
              </span>
            </button>
          </form>

          <button type="button" className={cardBase} onClick={() => setPhase("gallery")}>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-500">
              Browse
            </span>
            <span className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Choose My Template
            </span>
            <span className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Browse templates and pick your favorite.
            </span>
            <span className="mt-5 text-sm font-semibold text-zinc-900 group-hover:underline dark:text-zinc-100">
              Open gallery →
            </span>
          </button>
        </div>
      ) : (
        <div>
          {mode === "pick" ? (
            <div className="mb-6 flex justify-center">
              <button
                type="button"
                onClick={() => setPhase("intro")}
                className="text-sm font-semibold text-zinc-600 underline-offset-4 transition hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                ← Back to options
              </button>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {RESUME_TEMPLATES.map((t) => (
              <div
                key={t.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-md shadow-zinc-900/5 ring-1 ring-zinc-900/[0.03] dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-lg dark:ring-white/[0.04]"
              >
                <TemplateMiniPreview templateId={t.id} />
                <div className="flex flex-1 flex-col border-t border-zinc-200/90 p-4 sm:p-5 dark:border-zinc-800">
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    {t.name}
                  </h2>
                  <p className="mt-1 flex-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {t.tagline}
                  </p>
                  <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                    {t.categories.join(" · ")}
                  </p>
                  <form action={selectResumeTemplate} className="mt-4">
                    <input type="hidden" name="resumeId" value={resumeId} />
                    <input type="hidden" name="templateId" value={t.id} />
                    <input
                      type="hidden"
                      name="changeOnly"
                      value={changeOnly ? "1" : "0"}
                    />
                    <button type="submit" className={btnPrimary}>
                      Select
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mt-10 text-center text-xs text-zinc-500 dark:text-zinc-500">
        You can change your template any time from the editor — nothing you write is lost.
      </p>

      {mode === "change" ? (
        <div className="mt-6 flex justify-center">
          <Link
            href={`/resumes/${resumeId}`}
            className="text-sm font-semibold text-zinc-600 underline-offset-4 transition hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Cancel — back to editor
          </Link>
        </div>
      ) : null}
    </div>
  );
}
