import {
  defaultResumeContent,
  normalizeResumeContent,
  type ResumeContent,
} from "@/lib/resume/types";

/** Public builder localStorage payload (no login). */
export const LOCAL_RESUME_DRAFT_KEY = "resumeblues:resume-draft:v1";

export type LocalResumeDraft = {
  title: string;
  content: ResumeContent;
};

function safeParse(json: string): unknown {
  try {
    return JSON.parse(json) as unknown;
  } catch {
    return null;
  }
}

export function loadLocalResumeDraft(
  key: string = LOCAL_RESUME_DRAFT_KEY,
): LocalResumeDraft | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return null;
  }
  const v = safeParse(raw);
  if (!v || typeof v !== "object") {
    return null;
  }
  const o = v as Record<string, unknown>;
  const title = typeof o.title === "string" ? o.title : "Untitled Resume";
  const content = normalizeResumeContent(o.content);
  return {
    title,
    content: {
      ...content,
      meta: { ...content.meta, templateSelectionComplete: true },
    },
  };
}

export function saveLocalResumeDraft(
  draft: LocalResumeDraft,
  key: string = LOCAL_RESUME_DRAFT_KEY,
): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(
      key,
      JSON.stringify({ title: draft.title, content: draft.content }),
    );
  } catch {
    // quota / private mode
  }
}

export function clearLocalResumeDraft(
  key: string = LOCAL_RESUME_DRAFT_KEY,
): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function defaultDraftTitle(): string {
  return "Untitled Resume";
}

export function initialBlankDraft(): LocalResumeDraft {
  return { title: defaultDraftTitle(), content: defaultResumeContent() };
}
