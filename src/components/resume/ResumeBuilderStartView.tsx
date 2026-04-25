"use client";

import { useEffect, useState } from "react";
import { btnPrimary, labelClass, btnSecondary } from "@/components/resume/form-classes";

const cardBase =
  "w-full rounded-2xl border border-zinc-200/90 bg-white p-5 text-left shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6";

type Sub = "main" | "upload" | "unfinishedChoice";

type Props = {
  uploadIntent: boolean;
  /** There is a local guided draft the user may want to keep. */
  hasUnfinishedDraft: boolean;
  loading: boolean;
  error: string | null;
  onClearError: () => void;
  onStartGuided: () => void;
  onUploadFile: (file: File) => void;
  onContinueUnfinishedResume: () => void;
};

function initialSub(
  uploadIntent: boolean,
  hasUnfinishedDraft: boolean,
): Sub {
  if (uploadIntent && hasUnfinishedDraft) {
    return "unfinishedChoice";
  }
  if (uploadIntent) {
    return "upload";
  }
  return "main";
}

export function ResumeBuilderStartView({
  uploadIntent,
  hasUnfinishedDraft,
  loading,
  error,
  onClearError,
  onStartGuided,
  onUploadFile,
  onContinueUnfinishedResume,
}: Props) {
  const [sub, setSub] = useState<Sub>(() =>
    initialSub(uploadIntent, hasUnfinishedDraft),
  );

  useEffect(() => {
    setSub(initialSub(uploadIntent, hasUnfinishedDraft));
  }, [uploadIntent, hasUnfinishedDraft]);

  const backFromUpload = () => {
    onClearError();
    if (uploadIntent && hasUnfinishedDraft) {
      setSub("unfinishedChoice");
    } else {
      setSub("main");
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      {sub === "unfinishedChoice" && uploadIntent && hasUnfinishedDraft ? (
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            New resume from a file
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            You have an unfinished resume. Uploading a resume will start a new draft.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              className={btnPrimary}
              onClick={() => {
                onClearError();
                setSub("upload");
              }}
            >
              Upload resume
            </button>
            <button
              type="button"
              className={btnSecondary}
              onClick={() => {
                onClearError();
                onContinueUnfinishedResume();
              }}
            >
              Continue unfinished resume
            </button>
          </div>
        </div>
      ) : null}

      {sub === "main" ? (
        <>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            How do you want to start?
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Quick questions — no account needed. We save as you go in this browser.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              className={cardBase}
              onClick={() => {
                onClearError();
                onStartGuided();
              }}
            >
              <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Start interview
              </span>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Answer one simple question at a time. Use AI or preview anytime.
              </p>
            </button>
            <button
              type="button"
              className={cardBase}
              onClick={() => {
                onClearError();
                setSub("upload");
              }}
            >
              <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Upload my existing resume
              </span>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                PDF, DOCX, or TXT — we&apos;ll drop you into the same interview to
                edit.
              </p>
            </button>
          </div>
        </>
      ) : null}

      {sub === "upload" ? (
        <div>
          <button
            type="button"
            onClick={backFromUpload}
            className="mb-4 text-sm font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Upload resume
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            PDF, DOCX, or TXT. Max 5 MB. Legacy .doc is not supported — use DOCX.
          </p>
          <div className="mt-6">
            <label className={labelClass} htmlFor="start-file">
              File
            </label>
            <input
              id="start-file"
              type="file"
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              className="mt-2 block w-full text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-zinc-900 hover:file:bg-zinc-200 dark:text-zinc-400 dark:file:bg-zinc-800 dark:file:text-zinc-100 dark:hover:file:bg-zinc-700"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  onUploadFile(f);
                  e.target.value = "";
                }
              }}
              disabled={loading}
            />
          </div>
          {error ? (
            <p className="mt-4 text-sm font-medium text-red-600 dark:text-red-400">
              {error}
            </p>
          ) : null}
          <button
            type="button"
            className={`${btnSecondary} mt-6`}
            onClick={() => {
              if (hasUnfinishedDraft) {
                if (
                  !window.confirm(
                    "This will replace your current saved draft with a blank form. Continue?",
                  )
                ) {
                  return;
                }
              }
              onStartGuided();
            }}
            disabled={loading}
          >
            Skip — start with a blank form
          </button>
        </div>
      ) : null}
    </div>
  );
}
