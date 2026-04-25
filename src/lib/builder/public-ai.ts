import type { ResumeContent } from "@/lib/resume/types";
import type { TailorResult } from "@/lib/ai/actions";

type OkFail<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function publicFetchSummary(
  content: ResumeContent,
): Promise<OkFail<{ suggestion: string }>> {
  const res = await fetch("/api/builder/generate-summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  const j = (await res.json()) as { error?: string; suggestion?: string };
  if (!res.ok) {
    return { ok: false, error: j.error ?? "Request failed" };
  }
  if (typeof j.suggestion !== "string" || !j.suggestion.trim()) {
    return { ok: false, error: "No suggestion returned" };
  }
  return { ok: true, data: { suggestion: j.suggestion } };
}

export async function publicFetchBullet(
  text: string,
): Promise<OkFail<{ suggestion: string }>> {
  const res = await fetch("/api/builder/improve-bullet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const j = (await res.json()) as { error?: string; suggestion?: string };
  if (!res.ok) {
    return { ok: false, error: j.error ?? "Request failed" };
  }
  if (typeof j.suggestion !== "string" || !j.suggestion.trim()) {
    return { ok: false, error: "No suggestion returned" };
  }
  return { ok: true, data: { suggestion: j.suggestion } };
}

export async function publicFetchTailor(
  jobDescription: string,
  content: ResumeContent,
): Promise<OkFail<TailorResult>> {
  const res = await fetch("/api/builder/tailor-job", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobDescription, content }),
  });
  const j = (await res.json()) as {
    error?: string;
    summary?: string;
    alignmentNotes?: string;
  };
  if (!res.ok) {
    return { ok: false, error: j.error ?? "Request failed" };
  }
  if (typeof j.summary !== "string" || !j.summary.trim()) {
    return { ok: false, error: "No summary returned" };
  }
  return {
    ok: true,
    data: {
      summary: j.summary,
      ...(typeof j.alignmentNotes === "string" &&
      j.alignmentNotes.trim() !== ""
        ? { alignmentNotes: j.alignmentNotes.trim() }
        : {}),
    },
  };
}

/** Placeholder `resumeId` for step components; AI uses public routes. */
export const PUBLIC_BUILDER_RESUME_ID = "__public__";
