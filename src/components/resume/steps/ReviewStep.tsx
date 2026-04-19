"use client";

import type { ReactNode } from "react";
import type { ResumeContent } from "@/lib/resume/types";
import { btnPrimary } from "@/components/resume/form-classes";

type Props = {
  content: ResumeContent;
  title: string;
  onDownloadNow: () => void;
  downloadDisabled?: boolean;
  downloadBusy?: boolean;
};

function CheckRow({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <li className="flex gap-3 text-sm">
      <span
        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
          ok
            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
            : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
        }`}
        aria-hidden
      >
        {ok ? "✓" : ""}
      </span>
      <span
        className={
          ok
            ? "font-medium text-zinc-800 dark:text-zinc-200"
            : "text-zinc-500 dark:text-zinc-500"
        }
      >
        {children}
      </span>
    </li>
  );
}

export function ReviewStep({
  content,
  title,
  onDownloadNow,
  downloadDisabled,
  downloadBusy,
}: Props) {
  const { contact, target, summary, experience, skills, education } = content;

  const hasName = !!contact.fullName?.trim();
  const hasReach =
    !!contact.email?.trim() ||
    !!contact.phone?.trim() ||
    contact.links.some((l) => l.url);
  const hasTarget = !!(target.jobTitle || target.company);
  const hasSummary = !!summary.text?.trim();
  const hasJobs = experience.items.length > 0;
  const hasSkills = skills.groups.some(
    (g) => g.name.trim() || g.items.some((s) => s.trim()),
  );
  const hasEducation = education.items.length > 0;

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          You’re on the final step. Your formatted resume stays visible in the{" "}
          <strong className="font-semibold text-zinc-800 dark:text-zinc-200">
            live preview
          </strong>{" "}
          — use this checklist before you export.
        </p>
        {title?.trim() ? (
          <p className="mt-3 text-xs font-medium text-zinc-500 dark:text-zinc-500">
            Document: {title.trim()}
          </p>
        ) : null}
      </div>

      <div className="rounded-2xl border border-zinc-200/90 bg-zinc-50/80 p-5 dark:border-zinc-700 dark:bg-zinc-900/40">
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
          Quality checklist
        </h3>
        <ul className="mt-4 space-y-3">
          <CheckRow ok={hasName}>Name stands out in the header</CheckRow>
          <CheckRow ok={hasReach}>Contact info is complete</CheckRow>
          <CheckRow ok={hasTarget}>Target role or company is clear</CheckRow>
          <CheckRow ok={hasSummary}>Summary sells your positioning</CheckRow>
          <CheckRow ok={hasJobs}>At least one role with impact bullets</CheckRow>
          <CheckRow ok={hasSkills}>Skills reflect the job</CheckRow>
          <CheckRow ok={hasEducation}>Education included (if relevant)</CheckRow>
        </ul>
      </div>

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Need changes? Jump back to any step from the progress rail — your preview
        updates instantly.
      </p>

      <div className="border-t border-zinc-200/90 pt-8 dark:border-zinc-800">
        <p className="mb-3 text-sm font-medium text-zinc-800 dark:text-zinc-200">
          Ready to export?
        </p>
        <button
          type="button"
          className={`${btnPrimary} w-full px-6 py-3.5 text-base shadow-md sm:w-auto sm:min-w-[14rem]`}
          onClick={onDownloadNow}
          disabled={downloadDisabled}
        >
          {downloadBusy ? "Preparing…" : "Download Now"}
        </button>
        <p className="mt-3 max-w-md text-xs leading-relaxed text-zinc-500 dark:text-zinc-500">
          Immediate PDF access after you complete checkout. You&apos;ll pay $1 today to
          start; after a 10-day intro, billing continues at $9.99/month until you cancel
          in your account billing portal. Same secure flow as &quot;Download PDF&quot; in
          the header.
        </p>
      </div>
    </div>
  );
}
