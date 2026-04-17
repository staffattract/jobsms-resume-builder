"use client";

import type { ResumeTarget } from "@/lib/resume/types";
import { inputClass, labelClass, textareaClass } from "@/components/resume/form-classes";

type Props = {
  value: ResumeTarget;
  onChange: (next: ResumeTarget) => void;
};

export function TargetStep({ value, onChange }: Props) {
  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Tailor your resume toward a specific role (optional).
      </p>
      <div>
        <label htmlFor="target-jobTitle" className={labelClass}>
          Target job title
        </label>
        <input
          id="target-jobTitle"
          className={inputClass}
          value={value.jobTitle ?? ""}
          onChange={(e) =>
            onChange({ ...value, jobTitle: e.target.value })
          }
          placeholder="e.g. Senior Software Engineer"
        />
      </div>
      <div>
        <label htmlFor="target-company" className={labelClass}>
          Company (optional)
        </label>
        <input
          id="target-company"
          className={inputClass}
          value={value.company ?? ""}
          onChange={(e) =>
            onChange({ ...value, company: e.target.value })
          }
          placeholder="e.g. Acme Corp"
        />
      </div>
      <div>
        <label htmlFor="target-notes" className={labelClass}>
          Notes
        </label>
        <textarea
          id="target-notes"
          className={textareaClass}
          value={value.notes ?? ""}
          onChange={(e) =>
            onChange({ ...value, notes: e.target.value })
          }
          rows={5}
          placeholder="Keywords from the job description, focus areas, or anything you want to remember while writing."
        />
      </div>
    </div>
  );
}
