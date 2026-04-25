"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { GuidedResumeBuilder } from "@/components/resume/GuidedResumeBuilder";
import { ResumeBuilderStartView } from "@/components/resume/ResumeBuilderStartView";
import {
  defaultScreen,
  migrateLegacyStep,
  type GuidedScreen,
} from "@/lib/builder/guided-cursor";
import {
  defaultResumeContent,
  normalizeResumeContent,
  type ResumeContent,
} from "@/lib/resume/types";
import { hasMeaningfulBuildContent } from "@/lib/resume/derive-resume-list-title";
import {
  LOCAL_RESUME_DRAFT_KEY,
  clearLocalResumeDraft,
  loadLocalResumeDraft,
} from "@/lib/resume/local-draft";

type Flow = "start" | "guided";

function resolveScreenFromDraft(ui: {
  v?: number;
  screen?: GuidedScreen;
  phase?: string;
  stepIndex?: number;
}): GuidedScreen {
  if (ui.v === 2) {
    if (ui.phase === "done") {
      return { kind: "done" };
    }
    if (ui.screen) {
      return ui.screen;
    }
    return defaultScreen();
  }
  if (
    (ui.phase === "interview" || ui.phase === "done") &&
    typeof ui.stepIndex === "number"
  ) {
    return migrateLegacyStep(ui.stepIndex, ui.phase === "done");
  }
  return defaultScreen();
}

type PublicResumeBuilderClientProps = {
  isLoggedIn?: boolean;
};

export function PublicResumeBuilderClient({ isLoggedIn = false }: PublicResumeBuilderClientProps) {
  const searchParams = useSearchParams();
  const uploadIntent = searchParams.get("upload") === "1";

  const [booted, setBooted] = useState(false);
  const [flow, setFlow] = useState<Flow>("start");
  const [initialContent, setInitialContent] = useState<ResumeContent>(defaultResumeContent);
  const [initialScreen, setInitialScreen] = useState<GuidedScreen>(defaultScreen);
  const [initialLinkedResumeId, setInitialLinkedResumeId] = useState<string | null>(null);
  const [hasUnfinishedDraft, setHasUnfinishedDraft] = useState(false);
  const [mountKey, setMountKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const d = loadLocalResumeDraft(LOCAL_RESUME_DRAFT_KEY);

    if (d) {
      setInitialContent(d.content);
      setInitialLinkedResumeId(d.linkedResumeId ?? null);
      if (d.ui?.phase === "interview" || d.ui?.phase === "done") {
        setInitialScreen(resolveScreenFromDraft(d.ui));
      } else {
        setInitialScreen(defaultScreen());
      }
    } else {
      setInitialContent(defaultResumeContent());
      setInitialScreen(defaultScreen());
      setInitialLinkedResumeId(null);
    }

    const hasUnfinished = !!d && (d.ui?.phase === "interview" || d.ui?.phase === "done" || hasMeaningfulBuildContent(d.content));
    setHasUnfinishedDraft(hasUnfinished);

    if (uploadIntent) {
      setFlow("start");
    } else if (d && (d.ui?.phase === "interview" || d.ui?.phase === "done")) {
      setFlow("guided");
    } else if (d && hasMeaningfulBuildContent(d.content)) {
      setFlow("guided");
      setInitialScreen(defaultScreen());
    } else {
      setFlow("start");
    }

    setBooted(true);
  }, [uploadIntent]);

  const handleUploadFile = useCallback(
    async (file: File) => {
      setError(null);
      setLoading(true);
      try {
        const form = new FormData();
        form.set("file", file);
        const res = await fetch("/api/builder/parse-upload", {
          method: "POST",
          body: form,
        });
        const j = (await res.json()) as {
          error?: string;
          content?: unknown;
        };
        if (!res.ok) {
          setError(j.error ?? "Upload failed. Try another file.");
          return;
        }
        if (!j.content) {
          setError("Invalid response. Try again.");
          return;
        }
        const next = normalizeResumeContent(j.content);
        setInitialContent({
          ...next,
          meta: { ...next.meta, templateSelectionComplete: true },
        });
        setInitialScreen(defaultScreen());
        setInitialLinkedResumeId(null);
        setHasUnfinishedDraft(hasMeaningfulBuildContent(next));
        setMountKey((k) => k + 1);
        setFlow("guided");
      } catch {
        setError("Network error. Check your connection and try again.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const onStartGuided = useCallback(() => {
    setInitialContent(defaultResumeContent());
    setInitialScreen(defaultScreen());
    setInitialLinkedResumeId(null);
    setHasUnfinishedDraft(false);
    setMountKey((k) => k + 1);
    setFlow("guided");
    setError(null);
  }, []);

  const onStartOver = useCallback(() => {
    clearLocalResumeDraft(LOCAL_RESUME_DRAFT_KEY);
    setInitialContent(defaultResumeContent());
    setInitialScreen(defaultScreen());
    setInitialLinkedResumeId(null);
    setHasUnfinishedDraft(false);
    setFlow("start");
    setError(null);
  }, []);

  const onContinueUnfinishedResume = useCallback(() => {
    setError(null);
    setFlow("guided");
  }, []);

  if (!booted) {
    return (
      <div className="py-20 text-center text-sm text-zinc-500">Loading…</div>
    );
  }

  return (
    <div>
      {flow === "start" ? (
        <ResumeBuilderStartView
          uploadIntent={uploadIntent}
          hasUnfinishedDraft={hasUnfinishedDraft}
          loading={loading}
          error={error}
          onClearError={() => setError(null)}
          onStartGuided={onStartGuided}
          onUploadFile={handleUploadFile}
          onContinueUnfinishedResume={onContinueUnfinishedResume}
        />
      ) : (
        <GuidedResumeBuilder
          key={mountKey}
          initialContent={initialContent}
          initialScreen={initialScreen}
          onStartOver={onStartOver}
          storageKey={LOCAL_RESUME_DRAFT_KEY}
          isLoggedIn={isLoggedIn}
          initialLinkedResumeId={initialLinkedResumeId}
        />
      )}
    </div>
  );
}

