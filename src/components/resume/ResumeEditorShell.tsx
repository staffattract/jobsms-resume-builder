"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ResumeContent } from "@/lib/resume/types";
import { updateResumeContent, updateResumeTitle } from "@/lib/resume/actions";
import { ContactStep } from "@/components/resume/steps/ContactStep";
import { TargetStep } from "@/components/resume/steps/TargetStep";
import { SummaryStep } from "@/components/resume/steps/SummaryStep";
import { ExperienceStep } from "@/components/resume/steps/ExperienceStep";
import { SkillsStep } from "@/components/resume/steps/SkillsStep";
import { EducationStep } from "@/components/resume/steps/EducationStep";
import { ReviewStep } from "@/components/resume/steps/ReviewStep";
import {
  inputClass,
  labelClass,
  btnPrimary,
  btnSecondary,
} from "@/components/resume/form-classes";
import { trackClientAnalyticsEvent } from "@/lib/analytics/track-client";
import { TailorJobModal } from "@/components/resume/TailorJobModal";
import { PdfPaywallModal } from "@/components/resume/PdfPaywallModal";
import { ResumeLivePreview } from "@/components/resume/ResumeLivePreview";
import type { TailorResult } from "@/lib/ai/actions";

const STEP_LABELS = [
  "Contact",
  "Target job",
  "Summary",
  "Work experience",
  "Skills",
  "Education",
  "Review",
] as const;

const AUTOSAVE_MS = 900;
const SAVED_MSG_MS = 2200;

type SaveStatus = "idle" | "saving" | "saved" | "error";

type Props = {
  resumeId: string;
  initialTitle: string;
  initialContent: ResumeContent;
};

function snapshot(title: string, content: ResumeContent) {
  return JSON.stringify({ title, content });
}

function StepStatusIcon({
  state,
  index,
}: {
  state: "done" | "active" | "upcoming";
  index: number;
}) {
  if (state === "done") {
    return (
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-600/15 dark:bg-emerald-500 dark:ring-emerald-500/20"
        aria-hidden
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M20 6L9 17l-5-5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  if (state === "active") {
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white shadow-md ring-4 ring-zinc-900/15 dark:bg-zinc-100 dark:text-zinc-900 dark:ring-zinc-100/25">
        {index + 1}
      </span>
    );
  }
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500">
      {index + 1}
    </span>
  );
}

export function ResumeEditorShell({
  resumeId,
  initialTitle,
  initialContent,
}: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState<ResumeContent>(initialContent);
  const [stepIndex, setStepIndex] = useState(
    () => initialContent.meta.lastStepIndex ?? 0,
  );
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tailorOpen, setTailorOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfErrorMessage, setPdfErrorMessage] = useState<string | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [canDownloadPdf, setCanDownloadPdf] = useState<boolean | null>(null);
  const [advancingStep, setAdvancingStep] = useState(false);

  const lastSavedSnapshot = useRef(snapshot(initialTitle, initialContent));
  const saveGeneration = useRef(0);
  const savedClearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchEntitlements = useCallback(async () => {
    try {
      const res = await fetch("/api/me/entitlements", {
        credentials: "include",
      });
      if (!res.ok) {
        setCanDownloadPdf(false);
        return;
      }
      const data = (await res.json()) as { canDownloadPdf?: boolean };
      setCanDownloadPdf(!!data.canDownloadPdf);
    } catch {
      setCanDownloadPdf(false);
    }
  }, []);

  useEffect(() => {
    void fetchEntitlements();
  }, [fetchEntitlements]);

  useEffect(() => {
    if (!paywallOpen) {
      void fetchEntitlements();
    }
  }, [paywallOpen, fetchEntitlements]);

  const clampedStep = useMemo(
    () => Math.min(Math.max(stepIndex, 0), STEP_LABELS.length - 1),
    [stepIndex],
  );

  const persist = useCallback(async (): Promise<boolean> => {
    const step = Math.min(Math.max(stepIndex, 0), STEP_LABELS.length - 1);
    const payload = {
      title,
      content: {
        ...content,
        meta: { ...content.meta, lastStepIndex: step },
      } satisfies ResumeContent,
    };
    const gen = ++saveGeneration.current;
    setSaveStatus("saving");
    setErrorMessage(null);
    try {
      await updateResumeTitle(resumeId, payload.title);
      await updateResumeContent(resumeId, payload.content);
      if (gen !== saveGeneration.current) {
        return false;
      }
      lastSavedSnapshot.current = snapshot(payload.title, payload.content);
      setSaveStatus("saved");
      if (savedClearTimer.current) {
        clearTimeout(savedClearTimer.current);
      }
      savedClearTimer.current = setTimeout(() => {
        setSaveStatus("idle");
        savedClearTimer.current = null;
      }, SAVED_MSG_MS);
      return true;
    } catch {
      if (gen !== saveGeneration.current) {
        return false;
      }
      setSaveStatus("error");
      setErrorMessage("Could not save. Check your connection and try again.");
      return false;
    }
  }, [resumeId, title, content, stepIndex]);

  const goToStep = useCallback((i: number) => {
    const next = Math.min(Math.max(i, 0), STEP_LABELS.length - 1);
    setStepIndex(next);
    setContent((c) => ({
      ...c,
      meta: { ...c.meta, lastStepIndex: next },
    }));
  }, []);

  useEffect(() => {
    const currentSnap = snapshot(title, content);
    if (currentSnap === lastSavedSnapshot.current) {
      return;
    }
    const timer = setTimeout(() => {
      void persist();
    }, AUTOSAVE_MS);
    return () => clearTimeout(timer);
  }, [title, content, persist]);

  useEffect(() => {
    return () => {
      if (savedClearTimer.current) {
        clearTimeout(savedClearTimer.current);
      }
    };
  }, []);

  function saveNow() {
    void persist();
  }

  async function downloadPdf() {
    setPdfLoading(true);
    setPdfErrorMessage(null);
    try {
      const entRes = await fetch("/api/me/entitlements", {
        credentials: "include",
      });
      if (!entRes.ok) {
        setPdfErrorMessage("Could not verify download access. Please try again.");
        return;
      }
      const ent = (await entRes.json()) as { canDownloadPdf?: boolean };
      if (!ent.canDownloadPdf) {
        setPaywallOpen(true);
        return;
      }
      if (snapshot(title, content) !== lastSavedSnapshot.current) {
        const saved = await persist();
        if (!saved || snapshot(title, content) !== lastSavedSnapshot.current) {
          return;
        }
      }
      const res = await fetch(`/api/resume/${resumeId}/pdf`, {
        credentials: "include",
      });
      if (res.status === 403) {
        try {
          const body = (await res.json()) as { code?: string };
          if (body?.code === "PDF_ENTITLEMENT_REQUIRED") {
            setPdfErrorMessage(
              "PDF download isn’t included with your current access.",
            );
            return;
          }
        } catch {
          // fall through
        }
        setPdfErrorMessage("Could not generate PDF. Please try again.");
        return;
      }
      if (!res.ok) {
        setPdfErrorMessage("Could not generate PDF. Please try again.");
        return;
      }
      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition");
      let filename = "resume.pdf";
      const m = cd?.match(/filename="([^"]+)"/);
      if (m?.[1]) {
        filename = m[1];
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      void fetchEntitlements();
    } catch {
      setPdfErrorMessage("Could not generate PDF. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  }

  const saveStatusLabel = (() => {
    if (saveStatus === "saving") {
      return "Saving…";
    }
    if (saveStatus === "saved") {
      return "Saved";
    }
    if (saveStatus === "error") {
      return "Save failed";
    }
    if (snapshot(title, content) === lastSavedSnapshot.current) {
      return "Up to date";
    }
    return "Unsaved changes";
  })();

  /** V1 tailor: only `summary.text` and `target.notes` — never contact, experience, skills, or education. */
  function applyTailor(data: TailorResult) {
    const nextSummaryText =
      typeof data.summary === "string" ? data.summary.trim() : "";
    const notesAddition =
      typeof data.alignmentNotes === "string" &&
      data.alignmentNotes.trim() !== ""
        ? data.alignmentNotes.trim()
        : undefined;

    setContent((c) => ({
      ...c,
      summary: { ...c.summary, text: nextSummaryText },
      target: {
        ...c.target,
        notes: notesAddition
          ? [c.target.notes?.trim(), notesAddition].filter(Boolean).join("\n\n")
          : c.target.notes,
      },
    }));
  }

  const exportAccess =
    canDownloadPdf === true
      ? "allowed"
      : canDownloadPdf === false
        ? "denied"
        : "pending";

  const handleNextStep = useCallback(async () => {
    if (clampedStep >= STEP_LABELS.length - 1) {
      return;
    }
    setAdvancingStep(true);
    try {
      const ok = await persist();
      if (!ok) {
        return;
      }
      goToStep(clampedStep + 1);
    } finally {
      setAdvancingStep(false);
    }
  }, [clampedStep, persist, goToStep]);

  const stepNavDisabled = advancingStep || saveStatus === "saving";

  const previewBlock = (
    <div className="flex min-h-0 flex-col">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2 px-0.5">
        <div>
          <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
            Live preview
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-500">
            {exportAccess === "pending"
              ? "Verifying export access…"
              : exportAccess === "denied"
                ? "Full document export requires a plan"
                : "Updates as you type"}
          </p>
        </div>
        <div
          className="flex min-h-[26px] items-center"
          aria-live="polite"
          aria-busy={exportAccess === "pending"}
        >
          {exportAccess === "pending" ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-2.5 py-1 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <span
                className="inline-block size-3.5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700 dark:border-zinc-600 dark:border-t-zinc-200"
                aria-hidden
              />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Verifying
              </span>
            </span>
          ) : exportAccess === "denied" ? (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900 dark:bg-amber-950/80 dark:text-amber-200">
              Export locked
            </span>
          ) : (
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
              PDF ready
            </span>
          )}
        </div>
      </div>
      <div
        className={
          exportAccess === "pending"
            ? "min-h-[200px] transition-opacity lg:min-h-[280px]"
            : ""
        }
      >
        <ResumeLivePreview
          content={content}
          title={title}
          exportAccess={exportAccess}
          onUnlockClick={() => setPaywallOpen(true)}
        />
      </div>
    </div>
  );

  return (
    <div className="font-sans text-zinc-900 antialiased dark:text-zinc-100">
      <TailorJobModal
        key={`${resumeId}-${tailorOpen ? "open" : "closed"}`}
        open={tailorOpen}
        onClose={() => setTailorOpen(false)}
        resumeId={resumeId}
        content={content}
        onApply={applyTailor}
      />
      <PdfPaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} />

      <header className="mb-6 rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <label htmlFor="resume-title" className={labelClass}>
              Resume title
            </label>
            <input
              id="resume-title"
              className={`${inputClass} max-w-2xl text-base font-medium`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Product Manager — 2025"
            />
          </div>
          <div className="flex flex-shrink-0 flex-col items-stretch gap-3 sm:items-end">
            <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
              <span
                className="text-xs font-medium text-zinc-500 dark:text-zinc-400"
                aria-live="polite"
              >
                {saveStatusLabel}
              </span>
              <Link
                href={`/resumes/${resumeId}/template?change=1`}
                className={`${btnSecondary} inline-flex items-center justify-center no-underline`}
              >
                Change template
              </Link>
              <button
                type="button"
                className={btnSecondary}
                onClick={() => setTailorOpen(true)}
              >
                Tailor to a job
              </button>
              <button
                type="button"
                className={btnSecondary}
                onClick={() => {
                  trackClientAnalyticsEvent("DOWNLOAD_PDF_CLICK");
                  void downloadPdf();
                }}
                disabled={pdfLoading || saveStatus === "saving"}
              >
                {pdfLoading ? "Preparing PDF…" : "Download PDF"}
              </button>
              <button
                type="button"
                className={btnPrimary}
                onClick={saveNow}
                disabled={saveStatus === "saving" || pdfLoading}
              >
                Save now
              </button>
            </div>
            {errorMessage ? (
              <p className="text-right text-sm font-medium text-red-600 dark:text-red-400">
                {errorMessage}
              </p>
            ) : null}
            {pdfErrorMessage ? (
              <p
                className="text-right text-sm font-medium text-red-600 dark:text-red-400"
                aria-live="polite"
              >
                {pdfErrorMessage}
              </p>
            ) : null}
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_min(340px,36vw)] lg:items-start lg:gap-8 xl:grid-cols-[minmax(0,1fr)_min(400px,38vw)] xl:gap-10">
        <div className="min-w-0 lg:min-h-[min(100%,60vh)]">
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-6 xl:gap-8">
            <nav
              className="lg:w-48 lg:shrink-0 xl:w-52"
              aria-label="Resume steps"
            >
              <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                Progress
              </p>
              <div className="relative lg:pl-0.5">
                <div
                  className="pointer-events-none absolute bottom-2 left-[15px] top-2 hidden w-px bg-gradient-to-b from-zinc-200 via-zinc-200 to-transparent dark:from-zinc-700 dark:via-zinc-700 lg:block"
                  aria-hidden
                />
                <ol className="relative z-[1] flex flex-row gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0 lg:[&::-webkit-scrollbar]:hidden">
                {STEP_LABELS.map((label, i) => {
                  const state =
                    i < clampedStep
                      ? "done"
                      : i === clampedStep
                        ? "active"
                        : "upcoming";
                  return (
                    <li key={label} className="lg:pb-5">
                      <button
                        type="button"
                        onClick={() => goToStep(i)}
                        aria-current={state === "active" ? "step" : undefined}
                        className={`flex min-w-[10.5rem] items-start gap-3 rounded-xl px-2 py-2 text-left transition lg:min-w-0 lg:w-full lg:px-1 ${
                          state === "active"
                            ? "bg-zinc-100/90 dark:bg-zinc-900/80"
                            : "hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                        }`}
                      >
                        <StepStatusIcon state={state} index={i} />
                        <span className="min-w-0 pt-1">
                          <span
                            className={`block text-sm font-semibold leading-tight ${
                              state === "upcoming"
                                ? "text-zinc-500 dark:text-zinc-500"
                                : "text-zinc-900 dark:text-zinc-100"
                            }`}
                          >
                            {label}
                          </span>
                          {state === "active" ? (
                            <span className="mt-0.5 block text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                              In progress
                            </span>
                          ) : state === "done" ? (
                            <span className="mt-0.5 block text-[11px] font-medium text-zinc-500 dark:text-zinc-500">
                              Complete
                            </span>
                          ) : (
                            <span className="mt-0.5 block text-[11px] text-zinc-400 dark:text-zinc-600">
                              Up next
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
                </ol>
              </div>
            </nav>

            <section className="min-w-0 flex-1 rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 md:p-8">
              <div className="mb-5 space-y-4 border-b border-zinc-100 pb-5 dark:border-zinc-800">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {STEP_LABELS[clampedStep]}
                  </h2>
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    Step {clampedStep + 1} of {STEP_LABELS.length}
                  </span>
                </div>
                <nav
                  className="flex flex-wrap items-stretch justify-between gap-2 sm:items-center"
                  aria-label="Step navigation"
                >
                  <button
                    type="button"
                    className={`${btnSecondary} inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 sm:flex-initial sm:justify-start`}
                    onClick={() => goToStep(clampedStep - 1)}
                    disabled={clampedStep === 0 || stepNavDisabled}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="shrink-0 opacity-80"
                      aria-hidden
                    >
                      <path
                        d="M15 18l-6-6 6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Back
                  </button>
                  <button
                    type="button"
                    className={`${btnSecondary} inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 sm:flex-initial sm:justify-end`}
                    onClick={() => {
                      void handleNextStep();
                    }}
                    disabled={
                      clampedStep >= STEP_LABELS.length - 1 || stepNavDisabled
                    }
                  >
                    {advancingStep ? "Saving…" : "Next"}
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="shrink-0 opacity-80"
                      aria-hidden
                    >
                      <path
                        d="M9 18l6-6-6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </nav>
              </div>

              {clampedStep === 0 && (
                <ContactStep
                  value={content.contact}
                  onChange={(contact) =>
                    setContent((c) => ({ ...c, contact }))
                  }
                />
              )}
              {clampedStep === 1 && (
                <TargetStep
                  value={content.target}
                  onChange={(target) => setContent((c) => ({ ...c, target }))}
                />
              )}
              {clampedStep === 2 && (
                <SummaryStep
                  resumeId={resumeId}
                  resumeContent={content}
                  value={content.summary}
                  onChange={(summary) =>
                    setContent((c) => ({ ...c, summary }))
                  }
                />
              )}
              {clampedStep === 3 && (
                <ExperienceStep
                  resumeId={resumeId}
                  value={content.experience}
                  onChange={(experience) =>
                    setContent((c) => ({ ...c, experience }))
                  }
                />
              )}
              {clampedStep === 4 && (
                <SkillsStep
                  value={content.skills}
                  onChange={(skills) => setContent((c) => ({ ...c, skills }))}
                />
              )}
              {clampedStep === 5 && (
                <EducationStep
                  value={content.education}
                  onChange={(education) =>
                    setContent((c) => ({ ...c, education }))
                  }
                />
              )}
              {clampedStep === 6 && (
                <ReviewStep
                  content={content}
                  title={title}
                  onDownloadNow={() => {
                    trackClientAnalyticsEvent("DOWNLOAD_PDF_CLICK");
                    void downloadPdf();
                  }}
                  downloadDisabled={pdfLoading || saveStatus === "saving"}
                  downloadBusy={pdfLoading}
                />
              )}
            </section>
          </div>
        </div>

        <aside className="hidden min-h-0 lg:sticky lg:top-6 lg:block lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto lg:pb-6 xl:pb-8">
          {previewBlock}
        </aside>
      </div>

      <div className="mt-10 border-t border-zinc-200/80 pt-10 dark:border-zinc-800 lg:hidden">
        <p className="mb-4 text-center text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
          Full-width preview
        </p>
        {previewBlock}
      </div>
    </div>
  );
}
