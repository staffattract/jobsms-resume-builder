"use client";

import { ResumeCtaHelpTooltip } from "@/components/resumes/ResumeCtaHelpTooltip";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const accept =
  ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const btnMin =
  "min-h-[52px] w-full rounded-xl px-4 py-3 pr-11 text-sm font-semibold";

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
        router.push(`/resumes/${data.resumeId}/template`);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-[52px] min-w-0 flex-col">
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
        className={`${btnMin} flex cursor-pointer items-center justify-center border border-black bg-white text-black shadow-sm transition hover:bg-zinc-50 disabled:opacity-60 dark:border-white dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-900`}
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? "Processing your resume…" : "Upload Resume"}
      </button>
      <ResumeCtaHelpTooltip
        ariaLabel="Upload resume help"
        text="Upload a resume and our AI will make it better."
      />
      {error ? (
        <p
          className="mt-2 text-center text-sm text-red-600 dark:text-red-400 sm:text-left"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
