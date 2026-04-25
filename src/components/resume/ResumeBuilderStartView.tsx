"use client";

import { useState } from "react";
import {
  inputClass,
  labelClass,
  btnPrimary,
  btnSecondary,
  textareaClass,
} from "@/components/resume/form-classes";

const cardBase =
  "w-full rounded-2xl border border-zinc-200/90 bg-white p-5 text-left shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6";

type Sub = "main" | "ai" | "upload";

type Props = {
  loading: boolean;
  error: string | null;
  onClearError: () => void;
  onGenerateAi: (jobTitle: string, experienceOrResume: string) => void;
  onUploadFile: (file: File) => void;
};

export function ResumeBuilderStartView({
  loading,
  error,
  onClearError,
  onGenerateAi,
  onUploadFile,
}: Props) {
  const [sub, setSub] = useState<Sub>("main");
  const [jobTitle, setJobTitle] = useState("");
  const [paste, setPaste] = useState("");

  return (
    <div className="mx-auto max-w-lg">
      {sub === "main" ? (
        <>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            How do you want to start?
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            No account required. You can work locally in your browser.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              className={cardBase}
              onClick={() => {
                onClearError();
                setSub("ai");
              }}
            >
              <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Build from scratch with AI
              </span>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                We&apos;ll generate a first draft you can edit.
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
                PDF, DOCX, or plain text. We import what you provide — no fake
                jobs or dates.
              </p>
            </button>
          </div>
        </>
      ) : null}

      {sub === "ai" ? (
        <div>
          <button
            type="button"
            onClick={() => {
              onClearError();
              setSub("main");
            }}
            className="mb-4 text-sm font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Build with AI
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Target job title is required. Paste experience if you have it.
          </p>
          <form
            className="mt-6 flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              onGenerateAi(jobTitle, paste);
            }}
          >
            <div>
              <label htmlFor="start-job" className={labelClass}>
                Job title <span className="text-red-600">*</span>
              </label>
              <input
                id="start-job"
                className={inputClass}
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Project Manager"
                required
                autoFocus
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="start-paste" className={labelClass}>
                Paste your experience or resume (optional)
              </label>
              <textarea
                id="start-paste"
                className={textareaClass}
                rows={8}
                value={paste}
                onChange={(e) => setPaste(e.target.value)}
                placeholder="Work history, achievements, or a full resume in plain text…"
                disabled={loading}
              />
            </div>
            {error ? (
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                {error}
              </p>
            ) : null}
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="submit"
                className={`${btnPrimary} w-full sm:w-auto`}
                disabled={loading || !jobTitle.trim()}
              >
                {loading ? "Working…" : "Generate resume with AI"}
              </button>
              <button
                type="button"
                className={`${btnSecondary} w-full sm:w-auto`}
                onClick={() => {
                  onClearError();
                  setSub("main");
                }}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {sub === "upload" ? (
        <div>
          <button
            type="button"
            onClick={() => {
              onClearError();
              setSub("main");
            }}
            className="mb-4 text-sm font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Upload resume
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            PDF, DOCX, or TXT. Max 5 MB.
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
        </div>
      ) : null}
    </div>
  );
}
