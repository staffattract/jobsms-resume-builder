"use client";

import Link from "next/link";
import { ResumeCtaHelpTooltip } from "@/components/resumes/ResumeCtaHelpTooltip";

const btnMin =
  "min-h-[52px] w-full rounded-xl px-4 py-3 pr-11 text-sm font-semibold";

export function UploadResumeButton() {
  return (
    <div className="relative flex min-h-[52px] min-w-0 flex-col">
      <Link
        href="/build?upload=1"
        className={`${btnMin} flex cursor-pointer items-center justify-center border border-black bg-white text-black shadow-sm transition hover:bg-zinc-50 dark:border-white dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-900`}
      >
        Upload Resume
      </Link>
      <ResumeCtaHelpTooltip
        ariaLabel="Upload resume help"
        text="Opens the public builder with the upload option."
      />
    </div>
  );
}
