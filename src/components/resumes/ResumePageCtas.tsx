"use client";

import { ResumeCtaHelpTooltip } from "@/components/resumes/ResumeCtaHelpTooltip";
import { UploadResumeButton } from "@/components/resumes/UploadResumeButton";
import { createResume } from "@/lib/resume/actions";

const btnMin = "min-h-[52px] w-full rounded-xl px-4 py-3 pr-11 text-sm font-semibold";

export function ResumePageCtas() {
  return (
    <div className="w-full sm:max-w-xl">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <div className="relative min-h-[52px]">
          <form action={createResume} className="block h-full">
            <button
              type="submit"
              className={`${btnMin} flex cursor-pointer items-center justify-center bg-black text-white shadow-sm transition hover:bg-zinc-900 dark:bg-black dark:text-white dark:hover:bg-zinc-900`}
            >
              Create Resume
            </button>
          </form>
          <ResumeCtaHelpTooltip
            ariaLabel="Create resume help"
            text="Create a brand new resume from scratch."
          />
        </div>
        <UploadResumeButton />
      </div>
    </div>
  );
}
