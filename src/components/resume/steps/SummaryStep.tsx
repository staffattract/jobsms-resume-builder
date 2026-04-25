"use client";

import type { ResumeContent, ResumeSummary } from "@/lib/resume/types";
import { generateSummaryAction } from "@/lib/ai/actions";
import { AiSuggestionInline } from "@/components/resume/AiSuggestionInline";
import { labelClass, textareaClass } from "@/components/resume/form-classes";

type Props = {
  resumeId: string;
  resumeContent: ResumeContent;
  value: ResumeSummary;
  onChange: (next: ResumeSummary) => void;
  /** When set, used instead of the logged-in server action (e.g. public /build). */
  fetchSummarySuggestion?: (content: ResumeContent) => Promise<
    | { ok: true; data: { suggestion: string } }
    | { ok: false; error: string }
  >;
};

export function SummaryStep({
  resumeId,
  resumeContent,
  value,
  onChange,
  fetchSummarySuggestion,
}: Props) {
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        A short overview of who you are and what you bring to the role.
      </p>
      <div>
        <label htmlFor="summary-text" className={labelClass}>
          Professional summary
        </label>
        <textarea
          id="summary-text"
          className={textareaClass}
          value={value.text}
          onChange={(e) =>
            onChange({ ...value, text: e.target.value })
          }
          rows={10}
          placeholder="Write 2–4 sentences: your role, years of experience, key strengths, and what you’re looking for next."
        />
      </div>
      <AiSuggestionInline
        runLabel="Draft summary with AI"
        onGenerate={async () => {
          const r = fetchSummarySuggestion
            ? await fetchSummarySuggestion(resumeContent)
            : await generateSummaryAction(resumeId, resumeContent);
          return r.ok
            ? { ok: true, text: r.data.suggestion }
            : { ok: false, error: r.error };
        }}
        onApply={(text) => onChange({ ...value, text })}
      />
    </div>
  );
}
