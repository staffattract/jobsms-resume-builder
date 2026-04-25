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

export function PublicResumeBuilderClient() {
  const searchParams = useSearchParams();
  const uploadIntent = searchParams.get("upload") === "1";

  const [booted, setBooted] = useState(false);
  const [flow, setFlow] = useState<Flow>("start");
  const [initialContent, setInitialContent] = useState<ResumeContent>(defaultResumeContent);
  const [initialScreen, setInitialScreen] = useState<GuidedScreen>(defaultScreen);
  const [mountKey, setMountKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const d = loadLocalResumeDraft(LOCAL_RESUME_DRAFT_KEY);
    if (d) {
      setInitialContent(d.content);
      if (d.ui?.phase === "interview" || d.ui?.phase === "done") {
        setFlow("guided");
        setInitialScreen(resolveScreenFromDraft(d.ui));
      } else if (hasMeaningfulContent(d.content)) {
        setFlow("guided");
        setInitialScreen(defaultScreen());
      }
    }
    setBooted(true);
  }, []);

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
    setMountKey((k) => k + 1);
    setFlow("guided");
    setError(null);
  }, []);

  const onStartOver = useCallback(() => {
    clearLocalResumeDraft(LOCAL_RESUME_DRAFT_KEY);
    setInitialContent(defaultResumeContent());
    setInitialScreen(defaultScreen());
    setFlow("start");
    setError(null);
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
          loading={loading}
          error={error}
          onClearError={() => setError(null)}
          onStartGuided={onStartGuided}
          onUploadFile={handleUploadFile}
        />
      ) : (
        <GuidedResumeBuilder
          key={mountKey}
          initialContent={initialContent}
          initialScreen={initialScreen}
          onStartOver={onStartOver}
          storageKey={LOCAL_RESUME_DRAFT_KEY}
        />
      )}
    </div>
  );
}

function hasMeaningfulContent(c: ResumeContent): boolean {
  if ((c.contact.fullName ?? "").trim()) {
    return true;
  }
  if ((c.target.jobTitle ?? "").trim()) {
    return true;
  }
  if (c.experience.items.length) {
    return true;
  }
  return false;
}
