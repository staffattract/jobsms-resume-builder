"use client";

import { useState } from "react";
import {
  btnPrimary,
  btnSecondary,
  textareaClass,
  labelClass,
} from "@/components/resume/form-classes";

type RunResult = { ok: true; text: string } | { ok: false; error: string };

type Props = {
  runLabel: string;
  onGenerate: () => Promise<RunResult>;
  onApply: (text: string) => void;
};

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4" />
      <path d="M22 5h-4" />
      <path d="M4 17v2" />
      <path d="M5 18H3" />
    </svg>
  );
}

export function AiSuggestionInline({ runLabel, onGenerate, onApply }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setOpen(true);
    setLoading(true);
    setError(null);
    const r = await onGenerate();
    setLoading(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setDraft(r.text);
  }

  function apply() {
    onApply(draft.trim());
    setOpen(false);
    setDraft("");
    setError(null);
  }

  function dismiss() {
    setOpen(false);
    setDraft("");
    setError(null);
  }

  return (
    <div className="mt-4 w-full min-w-0 border-t border-zinc-200/90 pt-4 dark:border-zinc-700/90">
      <button
        type="button"
        className={`${btnSecondary} gap-2`}
        onClick={run}
        disabled={loading}
      >
        <SparklesIcon className="text-violet-600 dark:text-violet-400" />
        {loading ? "Working…" : runLabel}
      </button>
      {open ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-violet-200/70 bg-gradient-to-br from-violet-50/90 via-white to-zinc-50/80 p-5 shadow-md shadow-violet-950/5 ring-1 ring-violet-900/[0.04] dark:border-violet-900/50 dark:from-violet-950/40 dark:via-zinc-950 dark:to-zinc-950 dark:ring-white/5">
          {loading ? (
            <div className="flex items-center gap-3 py-2">
              <span
                className="inline-block size-4 animate-spin rounded-full border-2 border-violet-300 border-t-violet-700 dark:border-violet-700 dark:border-t-violet-200"
                aria-hidden
              />
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Crafting a suggestion…
              </p>
            </div>
          ) : null}
          {error && !loading ? (
            <div className="flex flex-col gap-3 py-1">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                {error}
              </p>
              <button
                type="button"
                className={`${btnSecondary} self-start`}
                onClick={run}
              >
                Try again
              </button>
            </div>
          ) : null}
          {!loading && draft !== "" ? (
            <>
              <label className={`${labelClass} text-violet-900/80 dark:text-violet-200/90`}>
                Suggestion — edit before applying
              </label>
              <textarea
                className={`${textareaClass} mt-2 border-violet-200/60 bg-white/90 dark:border-violet-900/40 dark:bg-zinc-950/80`}
                rows={5}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" className={`${btnPrimary} min-w-[7rem]`} onClick={apply}>
                  Apply suggestion
                </button>
                <button
                  type="button"
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                  onClick={dismiss}
                >
                  Dismiss
                </button>
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
