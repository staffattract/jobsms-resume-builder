"use client";

import Link from "next/link";
import { ResumeCtaHelpTooltip } from "@/components/resumes/ResumeCtaHelpTooltip";
import { UploadResumeButton } from "@/components/resumes/UploadResumeButton";

const btnMin = "min-h-[52px] w-full rounded-xl px-4 py-3 pr-11 text-sm font-semibold";

export function ResumePageCtas() {
  return (
    <div className="w-full sm:max-w-xl">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <div className="relative min-h-[52px]">
          <Link
            href="/build"
            className={`${btnMin} flex cursor-pointer items-center justify-center bg-black text-white shadow-sm transition hover:bg-zinc-900 dark:bg-black dark:text-white dark:hover:bg-zinc-900`}
          >
            Create Resume
          </Link>
          <ResumeCtaHelpTooltip
            ariaLabel="Create resume help"
            text="Build or upload in the public resume interview — no template step."
          />
        </div>
        <UploadResumeButton />
      </div>
    </div>
  );
}
