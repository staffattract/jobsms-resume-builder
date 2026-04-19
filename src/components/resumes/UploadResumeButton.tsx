"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const accept =
  ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const btnClass =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-zinc-400 hover:bg-zinc-50 active:scale-[0.99] disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-800 sm:w-auto";

export function UploadResumeButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/resume/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { resumeId?: string; error?: string };
      if (!res.ok) {
        const raw = data.error ?? "Something went wrong.";
        setError(
          raw.includes("Could not read your resume")
            ? "We couldn't read your resume clearly. Try uploading a DOCX or a text-based PDF."
            : raw,
        );
        return;
      }
      if (data.resumeId) {
        router.push(`/resumes/${data.resumeId}`);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto">
      <input
        ref={inputRef}
        type="file"
        name="file"
        accept={accept}
        className="sr-only"
        aria-hidden
        tabIndex={-1}
        onChange={(e) => void onChange(e)}
      />
      <button
        type="button"
        className={btnClass}
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          aria-hidden
        >
          <path d="M12 15V3m0 0L8 7m4-4l4 4" strokeLinecap="round" strokeLinejoin="round" />
          <path
            d="M2 17a4 4 0 004 4h12a4 4 0 000-8h-1.5M6 21v-2a2 2 0 012-2h8a2 2 0 012 2v2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {busy ? "Processing your resume…" : "Upload resume & improve with AI"}
      </button>
      {error ? (
        <p className="text-center text-sm text-red-600 dark:text-red-400 sm:text-left" role="alert">
          {error}
        </p>
      ) : null}
      <p className="text-center text-xs text-zinc-500 dark:text-zinc-500 sm:text-left">
        PDF or DOCX, max 5 MB. We extract text, improve it with AI, then open the editor.
      </p>
    </div>
  );
}
