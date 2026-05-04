import type { TailorResult } from "@/lib/ai/actions";
import type { ResumeContent } from "@/lib/resume/types";

/** Same merge as `ResumeEditorShell.applyTailor` — summary + target notes append. */
export function mergeTailorIntoContent(
  content: ResumeContent,
  data: TailorResult,
): ResumeContent {
  const nextSummaryText =
    typeof data.summary === "string" ? data.summary.trim() : "";
  const notesAddition =
    typeof data.alignmentNotes === "string" &&
    data.alignmentNotes.trim() !== ""
      ? data.alignmentNotes.trim()
      : undefined;

  return {
    ...content,
    summary: { ...content.summary, text: nextSummaryText },
    target: {
      ...content.target,
      notes: notesAddition
        ? [content.target.notes?.trim(), notesAddition].filter(Boolean).join("\n\n")
        : content.target.notes,
    },
  };
}
