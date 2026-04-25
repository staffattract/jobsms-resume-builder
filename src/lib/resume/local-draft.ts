import {
  defaultResumeContent,
  normalizeResumeContent,
  type ResumeContent,
} from "@/lib/resume/types";

/** Public builder localStorage payload (no login). */
export const LOCAL_RESUME_DRAFT_KEY = "resumeblues:resume-draft:v1";

/** Public guided builder only — persisted with the draft. */
export type PublicBuilderUi = {
  phase: "start" | "interview" | "done";
  stepIndex: number;
};

export type LocalResumeDraft = {
  title: string;
  content: ResumeContent;
  /** Guided interview position (optional for older local drafts). */
  ui?: PublicBuilderUi;
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
  let ui: PublicBuilderUi | undefined;
  if (o.ui && typeof o.ui === "object") {
    const u = o.ui as Record<string, unknown>;
    if (
      (u.phase === "start" ||
        u.phase === "interview" ||
        u.phase === "done") &&
      typeof u.stepIndex === "number" &&
      u.stepIndex >= 0 &&
      u.stepIndex < 20
    ) {
      ui = { phase: u.phase, stepIndex: u.stepIndex };
    }
  }
  return {
    title,
    content: {
      ...content,
      meta: { ...content.meta, templateSelectionComplete: true },
    },
    ...(ui ? { ui } : {}),
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
      JSON.stringify({
        title: draft.title,
        content: draft.content,
        ...(draft.ui ? { ui: draft.ui } : {}),
      }),
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
