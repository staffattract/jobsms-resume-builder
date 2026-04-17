"use client";

import { useEffect, useState } from "react";
import type { ResumeContent } from "@/lib/resume/types";
import {
  tailorToJobAction,
  type TailorResult,
} from "@/lib/ai/actions";
import {
  btnPrimary,
  btnSecondary,
  textareaClass,
  labelClass,
} from "@/components/resume/form-classes";

type Props = {
  open: boolean;
  onClose: () => void;
  resumeId: string;
  content: ResumeContent;
  onApply: (data: TailorResult) => void;
};

export function TailorJobModal({
  open,
  onClose,
  resumeId,
  content,
  onApply,
}: Props) {
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaryDraft, setSummaryDraft] = useState("");
  const [notesDraft, setNotesDraft] = useState("");
  const [phase, setPhase] = useState<"paste" | "preview">("paste");

  useEffect(() => {
    if (!open) {
      return;
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function run() {
    setLoading(true);
    setError(null);
    const r = await tailorToJobAction(resumeId, jobDescription, content);
    setLoading(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setSummaryDraft(r.data.summary);
    setNotesDraft(r.data.alignmentNotes ?? "");
    setPhase("preview");
  }

  function apply() {
    const payload: TailorResult = {
      summary: summaryDraft.trim(),
      ...(notesDraft.trim() !== ""
        ? { alignmentNotes: notesDraft.trim() }
        : {}),
    };
    onApply(payload);
    onClose();
  }

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tailor-modal-title"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-zinc-200/90 bg-white shadow-2xl shadow-zinc-950/20 dark:border-zinc-700 dark:bg-zinc-950"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-zinc-100 px-6 pb-5 pt-6 dark:border-zinc-800 md:px-8 md:pt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700 dark:text-violet-400">
            AI-assisted
          </p>
          <h2
            id="tailor-modal-title"
            className="mt-1.5 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-2xl"
          >
            Tailor to a job posting
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Paste the role description. We’ll suggest a new professional summary
            and optional alignment notes — nothing changes until you apply.
          </p>
        </div>

        <div className="px-6 py-6 md:px-8 md:pb-8">
          {phase === "paste" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-violet-200/70 bg-gradient-to-br from-violet-50/90 to-white p-4 dark:border-violet-900/50 dark:from-violet-950/40 dark:to-zinc-950">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-violet-800 dark:text-violet-300">
                  What will change
                </p>
                <ul className="mt-3 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <li className="flex gap-2">
                    <span
                      className="mt-1.5 size-1.5 shrink-0 rounded-full bg-violet-500"
                      aria-hidden
                    />
                    <span>
                      <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
                        Summary
                      </strong>{" "}
                      — replaced with a version aligned to this posting.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span
                      className="mt-1.5 size-1.5 shrink-0 rounded-full bg-violet-500"
                      aria-hidden
                    />
                    <span>
                      <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
                        Target job notes
                      </strong>{" "}
                      — alignment notes appended (contact, experience, skills, and
                      education stay as you wrote them).
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <label htmlFor="tailor-jd" className={labelClass}>
                  Job description
                </label>
                <textarea
                  id="tailor-jd"
                  className={textareaClass}
                  rows={10}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full posting, or the responsibilities and requirements section…"
                />
              </div>

              {error ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                  {error}
                </p>
              ) : null}

              <div className="flex flex-col-reverse gap-3 border-t border-zinc-100 pt-6 dark:border-zinc-800 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  className={`${btnSecondary} w-full sm:w-auto`}
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`${btnPrimary} w-full min-w-[200px] sm:w-auto`}
                  onClick={() => void run()}
                  disabled={loading || !jobDescription.trim()}
                >
                  {loading ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <span
                        className="inline-block size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                        aria-hidden
                      />
                      Analyzing posting…
                    </span>
                  ) : (
                    "Generate suggestions"
                  )}
                </button>
              </div>
            </div>
          )}

          {phase === "preview" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/30">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-900 dark:text-emerald-300">
                  Review before applying
                </p>
                <p className="mt-2 text-sm leading-relaxed text-emerald-950/90 dark:text-emerald-100/90">
                  Edit the fields below, then apply to update your resume. You can
                  always undo by editing the Summary and Target steps.
                </p>
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl border border-zinc-200/90 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-900/40">
                  <label className={labelClass} htmlFor="tailor-summary">
                    New professional summary
                  </label>
                  <textarea
                    id="tailor-summary"
                    className={`${textareaClass} mt-2 max-w-none bg-white dark:bg-zinc-950`}
                    rows={6}
                    value={summaryDraft}
                    onChange={(e) => setSummaryDraft(e.target.value)}
                  />
                </div>
                <div className="rounded-2xl border border-zinc-200/90 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-900/40">
                  <label className={labelClass} htmlFor="tailor-notes">
                    Alignment notes (optional)
                  </label>
                  <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-500">
                    Appended to your Target job notes — keywords and themes to
                    emphasize.
                  </p>
                  <textarea
                    id="tailor-notes"
                    className={`${textareaClass} max-w-none bg-white dark:bg-zinc-950`}
                    rows={4}
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    placeholder="e.g. emphasize cross-functional leadership, metrics…"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-zinc-100 pt-6 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  className="text-sm font-semibold text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
                  onClick={() => {
                    setPhase("paste");
                    setSummaryDraft("");
                    setNotesDraft("");
                  }}
                >
                  ← Edit job description
                </button>
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:gap-3">
                  <button
                    type="button"
                    className={`${btnSecondary} w-full sm:w-auto`}
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={`${btnPrimary} w-full min-w-[180px] px-6 py-3 text-base sm:w-auto`}
                    onClick={apply}
                    disabled={!summaryDraft.trim()}
                  >
                    Apply to resume
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
