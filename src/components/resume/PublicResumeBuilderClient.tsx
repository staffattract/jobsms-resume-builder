"use client";

import { useCallback, useEffect, useState } from "react";
import { ResumeEditorShell } from "@/components/resume/ResumeEditorShell";
import { ResumeBuilderStartView } from "@/components/resume/ResumeBuilderStartView";
import {
  defaultResumeContent,
  normalizeResumeContent,
  type ResumeContent,
} from "@/lib/resume/types";
import {
  LOCAL_RESUME_DRAFT_KEY,
  clearLocalResumeDraft,
  loadLocalResumeDraft,
  defaultDraftTitle,
} from "@/lib/resume/local-draft";
import { PUBLIC_BUILDER_RESUME_ID } from "@/lib/builder/public-ai";

type Phase = "start" | "editor";

export function PublicResumeBuilderClient() {
  const [booted, setBooted] = useState(false);
  const [phase, setPhase] = useState<Phase>("start");
  const [editorKey, setEditorKey] = useState(0);
  const [title, setTitle] = useState(() => defaultDraftTitle());
  const [content, setContent] = useState<ResumeContent>(defaultResumeContent);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const d = loadLocalResumeDraft(LOCAL_RESUME_DRAFT_KEY);
    if (d) {
      setTitle(d.title);
      setContent(d.content);
      setPhase("editor");
    }
    setBooted(true);
  }, []);

  const goEditor = useCallback(
    (nextTitle: string, nextContent: ResumeContent) => {
      setError(null);
      setTitle(nextTitle);
      setContent(nextContent);
      setEditorKey((k) => k + 1);
      setPhase("editor");
    },
    [],
  );

  const handleGenerateAi = useCallback(
    async (jobTitle: string, experienceOrResume: string) => {
      setError(null);
      setLoading(true);
      try {
        const res = await fetch("/api/builder/generate-scratch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobTitle, experienceOrResume }),
        });
        const j = (await res.json()) as {
          error?: string;
          content?: unknown;
          title?: string;
        };
        if (!res.ok) {
          setError(j.error ?? "Could not generate. Try again.");
          return;
        }
        if (!j.content) {
          setError("Invalid response. Try again.");
          return;
        }
        const next = normalizeResumeContent(j.content);
        goEditor(
          j.title?.trim() || jobTitle.trim() || defaultDraftTitle(),
          {
            ...next,
            meta: { ...next.meta, templateSelectionComplete: true },
          },
        );
      } catch {
        setError("Network error. Check your connection and try again.");
      } finally {
        setLoading(false);
      }
    },
    [goEditor],
  );

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
          title?: string;
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
        goEditor(j.title?.trim() || defaultDraftTitle(), {
          ...next,
          meta: { ...next.meta, templateSelectionComplete: true },
        });
      } catch {
        setError("Network error. Check your connection and try again.");
      } finally {
        setLoading(false);
      }
    },
    [goEditor],
  );

  const onStartOver = useCallback(() => {
    clearLocalResumeDraft(LOCAL_RESUME_DRAFT_KEY);
    setTitle(defaultDraftTitle());
    setContent(defaultResumeContent());
    setEditorKey((k) => k + 1);
    setPhase("start");
    setError(null);
  }, []);

  if (!booted) {
    return (
      <div className="py-20 text-center text-sm text-zinc-500">Loading…</div>
    );
  }

  return (
    <div>
      {phase === "start" ? (
        <ResumeBuilderStartView
          loading={loading}
          error={error}
          onClearError={() => setError(null)}
          onGenerateAi={handleGenerateAi}
          onUploadFile={handleUploadFile}
        />
      ) : (
        <ResumeEditorShell
          key={editorKey}
          resumeId={PUBLIC_BUILDER_RESUME_ID}
          initialTitle={title}
          initialContent={content}
          publicBuilder={{
            storageKey: LOCAL_RESUME_DRAFT_KEY,
            onStartOver,
          }}
        />
      )}
    </div>
  );
}
