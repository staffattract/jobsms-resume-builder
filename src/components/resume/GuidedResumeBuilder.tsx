"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ResumeLivePreview } from "@/components/resume/ResumeLivePreview";
import {
  btnPrimary,
  btnSecondary,
  inputClass,
  labelClass,
  textareaClass,
} from "@/components/resume/form-classes";
import { canRunPartialAiFill } from "@/lib/builder/merge-partial-fill";
import { newId } from "@/lib/id";
import {
  defaultDraftTitle,
  saveLocalResumeDraft,
  type PublicBuilderUi,
} from "@/lib/resume/local-draft";
import {
  normalizeResumeContent,
  type ExperienceItem,
  type ResumeContent,
} from "@/lib/resume/types";

const AUTOSAVE_MS = 500;
const SAVED_MSG_MS = 2000;
const N_STEPS = 14;
const DONE = 14;

type SaveS = "idle" | "saving" | "saved";

type Props = {
  initialContent: ResumeContent;
  initialStepIndex: number;
  initialSubPhase: "interview" | "done";
  onStartOver: () => void;
  storageKey: string;
};

function tr(s: string | undefined): string {
  return (s ?? "").trim();
}

function splitName(full: string): { a: string; b: string } {
  const t = full.trim();
  if (!t) {
    return { a: "", b: "" };
  }
  const p = t.split(/\s+/);
  if (p.length === 1) {
    return { a: p[0]!, b: "" };
  }
  return { a: p[0]!, b: p.slice(1).join(" ") };
}

function joinName(a: string, b: string): string {
  return [a, b].map((x) => x.trim()).filter(Boolean).join(" ");
}

function readJ0(c: ResumeContent) {
  return c.experience.items[0];
}

function withJ0(
  c: ResumeContent,
  map: (j: ExperienceItem) => ExperienceItem,
): ResumeContent {
  const cur = c.experience.items;
  if (cur.length === 0) {
    return {
      ...c,
      experience: {
        items: [map({ id: newId(), employer: "", title: "", bullets: [] })],
      },
    };
  }
  return {
    ...c,
    experience: {
      items: [map({ ...cur[0]! }), ...cur.slice(1)],
    },
  };
}

function docTitle(c: ResumeContent): string {
  if (tr(c.target.jobTitle)) {
    const j = tr(c.target.jobTitle);
    return j.length > 88 ? `${j.slice(0, 85)}…` : j;
  }
  if (tr(c.contact.fullName)) {
    const n = tr(c.contact.fullName);
    return n.length > 70 ? `${n.slice(0, 67)}…` : n;
  }
  return defaultDraftTitle();
}

const LINES: { t: string; op?: true }[] = [
  { t: "What’s your first name?" },
  { t: "What’s your last name?" },
  { t: "What email should we show?" },
  { t: "What’s the best phone number?" },
  { t: "What city and state are you in? (e.g. Austin, TX)" },
  { t: "What job title are you going for next?" },
  { t: "What was your most recent job title?" },
  { t: "What company was that for?" },
  { t: "When did you start? (e.g. 2020-01)" },
  { t: "End date, or is it a current role?" },
  { t: "What did you do there? (one line per bullet point)" },
  { t: "Where did you go to school?", op: true },
  { t: "Degree and major (if you want them shown)", op: true },
  { t: "List your top skills, separated by commas" },
];

function applyStepCommit(
  step: number,
  c: ResumeContent,
  x: {
    nameA: string;
    nameB: string;
    endInput: string;
    current: boolean;
    duty: string;
    deg: string;
    skills: string;
  },
): ResumeContent {
  const n: ResumeContent = {
    ...c,
    contact: { ...c.contact, links: c.contact.links ?? [] },
    target: { ...c.target },
    summary: { ...c.summary },
    experience: { items: c.experience.items.map((i) => ({ ...i, bullets: i.bullets.map((b) => ({ ...b })) })) },
    skills: { groups: c.skills.groups.map((g) => ({ ...g, items: [...g.items] })) },
    education: { items: c.education.items.map((e) => ({ ...e })) },
    meta: { ...c.meta },
  };

  if (step === 1) {
    n.contact = { ...n.contact, fullName: joinName(x.nameA, x.nameB) };
  }
  if (step === 9) {
    const it0 = readJ0(n) ?? { id: newId(), employer: "", title: "", bullets: [] };
    const it = { ...it0 };
    it.endDate = x.current ? null : tr(x.endInput) === "" ? null : tr(x.endInput);
    n.experience = { items: [it, ...n.experience.items.slice(1)] };
  }
  if (step === 10) {
    const it0 = readJ0(n) ?? { id: newId(), employer: "", title: "", bullets: [] };
    const it = { ...it0 };
    const lines = tr(x.duty)
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    it.bullets = lines.length ? lines.map((text) => ({ id: newId(), text })) : [];
    n.experience = { items: [it, ...n.experience.items.slice(1)] };
  }
  if (step === 12) {
    const e = n.education.items[0]
      ? { ...n.education.items[0]! }
      : { id: newId(), institution: "" };
    const p = tr(x.deg);
    e.degree = p || undefined;
    e.field = undefined;
    n.education = { items: [e, ...n.education.items.slice(1)] };
  }
  if (step === 13) {
    const items = tr(x.skills)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    n.skills = {
      groups: items.length
        ? [{ id: n.skills.groups[0]?.id ?? newId(), name: "Skills", items }]
        : [],
    };
  }
  return n;
}

export function GuidedResumeBuilder({
  initialContent,
  initialStepIndex,
  initialSubPhase,
  onStartOver,
  storageKey,
}: Props) {
  const [content, setContent] = useState<ResumeContent>(initialContent);
  const [step, setStep] = useState(() =>
    initialSubPhase === "done" ? DONE : Math.min(Math.max(0, initialStepIndex), DONE),
  );
  const [saveState, setSaveS] = useState<SaveS>("idle");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiErr, setAiErr] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [entPdf, setEntPdf] = useState<boolean | null>(null);
  const [nameA, setNameA] = useState(() => splitName(initialContent.contact.fullName ?? "").a);
  const [nameB, setNameB] = useState(() => splitName(initialContent.contact.fullName ?? "").b);
  const j0 = initialContent.experience.items[0];
  const [endIn, setEndIn] = useState(() => {
    if (!j0 || j0.endDate === null) {
      return "";
    }
    return j0.endDate ? String(j0.endDate) : "";
  });
  const [cur, setCur] = useState(() => j0?.endDate === null);
  const [duty, setDuty] = useState(() =>
    (j0?.bullets ?? []).map((b) => b.text).join("\n"),
  );
  const e0 = initialContent.education.items[0];
  const [deg, setDeg] = useState(() =>
    [e0?.degree, e0?.field].filter(Boolean).join(" — "),
  );
  const [sk, setSk] = useState(() =>
    (initialContent.skills.groups[0]?.items ?? []).join(", "),
  );

  const g = useRef(0);
  const tmr = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchE = useCallback(async () => {
    try {
      const r = await fetch("/api/me/entitlements", { credentials: "include" });
      if (!r.ok) {
        setEntPdf(false);
        return;
      }
      const d = (await r.json()) as { canDownloadPdf?: boolean };
      setEntPdf(!!d.canDownloadPdf);
    } catch {
      setEntPdf(false);
    }
  }, []);
  useEffect(() => {
    void fetchE();
  }, [fetchE]);

  const doSave = useCallback(() => {
    const x = ++g.current;
    setSaveS("saving");
    const ui: PublicBuilderUi =
      step >= DONE ? { phase: "done", stepIndex: DONE } : { phase: "interview", stepIndex: step };
    saveLocalResumeDraft({ title: docTitle(content), content, ui }, storageKey);
    if (x !== g.current) {
      return;
    }
    setSaveS("saved");
    if (tmr.current) {
      clearTimeout(tmr.current);
    }
    tmr.current = setTimeout(() => {
      setSaveS("idle");
      tmr.current = null;
    }, SAVED_MSG_MS);
  }, [content, step, storageKey]);

  useEffect(() => {
    const t = setTimeout(doSave, AUTOSAVE_MS);
    return () => clearTimeout(t);
  }, [content, step, doSave]);

  useEffect(() => {
    if (step >= 6 && step <= 10) {
      setContent((c) => {
        if (c.experience.items.length) {
          return c;
        }
        const u = { ...c };
        u.experience = {
          items: [{ id: newId(), employer: "", title: "", bullets: [] }],
        };
        return u;
      });
    }
  }, [step]);

  useEffect(() => {
    if (step >= 11 && step <= 12) {
      setContent((c) => {
        if (c.education.items.length) {
          return c;
        }
        const u = { ...c };
        u.education = { items: [{ id: newId(), institution: "" }] };
        return u;
      });
    }
  }, [step]);

  const j0End = content.experience.items[0]?.endDate;
  const endSnap =
    j0End === null ? "null" : j0End === undefined ? "undef" : String(j0End);
  const prevS = useRef(step);
  useEffect(() => {
    if (step === 9 && prevS.current !== 9) {
      const j = content.experience.items[0];
      if (j) {
        setCur(j.endDate === null);
        setEndIn(j.endDate == null || j.endDate === null ? "" : String(j.endDate));
      }
    }
    prevS.current = step;
  }, [step, endSnap]);

  const ex = (entPdf === true ? "allowed" : entPdf === false ? "denied" : "pending") as
    | "allowed"
    | "pending"
    | "denied";
  const canAi = canRunPartialAiFill(content);

  const syncLocalsFromContent = (c: ResumeContent) => {
    const sp = splitName(c.contact.fullName ?? "");
    setNameA(sp.a);
    setNameB(sp.b);
    const job = c.experience.items[0];
    if (job) {
      setDuty(job.bullets.map((b) => b.text).join("\n"));
      setCur(job.endDate === null);
      setEndIn(job.endDate == null || job.endDate === null ? "" : String(job.endDate));
    }
    const ed = c.education.items[0];
    setDeg([ed?.degree, ed?.field].filter(Boolean).join(" — "));
    setSk((c.skills.groups[0]?.items ?? []).join(", "));
  };

  const runAi = async () => {
    if (!canAi) {
      setAiErr("Add a target job or work experience first.");
      return;
    }
    setAiErr(null);
    setAiBusy(true);
    try {
      const r = await fetch("/api/builder/fill-partial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const j = (await r.json()) as { error?: string; content?: unknown };
      if (!r.ok) {
        setAiErr(j.error ?? "AI fill failed.");
        return;
      }
      if (!j.content) {
        setAiErr("Invalid response.");
        return;
      }
      const n = normalizeResumeContent(j.content);
      setContent((p) => ({
        ...n,
        meta: {
          ...n.meta,
          ...p.meta,
          templateId: p.meta.templateId,
          templateSelectionComplete: true,
        },
      }));
      syncLocalsFromContent(n);
    } catch {
      setAiErr("Network error. Try again.");
    } finally {
      setAiBusy(false);
    }
  };

  const goNext = () => {
    if (aiBusy) {
      return;
    }
    setContent((c) =>
      applyStepCommit(step, c, {
        nameA,
        nameB,
        endInput: endIn,
        current: cur,
        duty,
        deg,
        skills: sk,
      }),
    );
    if (step < N_STEPS - 1) {
      setStep((s) => s + 1);
    } else {
      setStep(DONE);
    }
  };

  const goBack = () => {
    if (aiBusy) {
      return;
    }
    if (step === DONE) {
      setStep(13);
      return;
    }
    if (step <= 0) {
      return;
    }
    setStep((s) => s - 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="text-sm font-semibold text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Home
        </Link>
        <div className="flex items-center gap-3 text-xs font-medium text-zinc-500 dark:text-zinc-400" aria-live="polite">
          {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : null}
        </div>
        <button
          type="button"
          onClick={onStartOver}
          className="text-sm font-semibold text-zinc-500 underline-offset-2 transition hover:text-zinc-900 hover:underline dark:hover:text-zinc-200"
        >
          Start over
        </button>
      </div>

      {aiErr ? (
        <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">
          {aiErr}
        </p>
      ) : null}

      {step < DONE && !preview ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Step {step + 1} of {N_STEPS}
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {LINES[step]?.t ?? ""}
            {LINES[step]?.op ? <span className="text-sm font-normal text-zinc-500"> (optional)</span> : null}
          </h2>
        </div>
      ) : null}

      {step === DONE && !preview ? (
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-6 dark:border-emerald-900/40 dark:bg-emerald-950/30">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Nice work.</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            Preview your resume, use AI to tighten wording, or go back to change any answer.
          </p>
        </div>
      ) : null}

      {preview ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Preview</h3>
            <button type="button" className={btnSecondary} onClick={() => setPreview(false)}>
              Close preview
            </button>
          </div>
          <div className="max-h-[70vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900/50">
            <ResumeLivePreview
              content={content}
              title={docTitle(content)}
              exportAccess={ex}
              onUnlockClick={() => {}}
            />
          </div>
        </div>
      ) : null}

      {!preview && step === 0 ? (
        <div>
          <label className={labelClass} htmlFor="g0">
            First name
          </label>
          <input
            id="g0"
            className={inputClass}
            value={nameA}
            onChange={(e) => setNameA(e.target.value)}
            autoFocus
            autoComplete="given-name"
          />
        </div>
      ) : null}

      {!preview && step === 1 ? (
        <div>
          <label className={labelClass} htmlFor="g1">
            Last name
          </label>
          <input
            id="g1"
            className={inputClass}
            value={nameB}
            onChange={(e) => setNameB(e.target.value)}
            autoFocus
            autoComplete="family-name"
          />
        </div>
      ) : null}

      {!preview && step === 2 ? (
        <div>
          <label className={labelClass} htmlFor="g2">
            Email
          </label>
          <input
            id="g2"
            className={inputClass}
            type="email"
            value={content.contact.email ?? ""}
            onChange={(e) =>
              setContent((c) => ({ ...c, contact: { ...c.contact, email: e.target.value } }))
            }
            autoFocus
            autoComplete="email"
          />
        </div>
      ) : null}

      {!preview && step === 3 ? (
        <div>
          <label className={labelClass} htmlFor="g3">
            Phone
          </label>
          <input
            id="g3"
            className={inputClass}
            type="tel"
            value={content.contact.phone ?? ""}
            onChange={(e) =>
              setContent((c) => ({ ...c, contact: { ...c.contact, phone: e.target.value } }))
            }
            autoFocus
            autoComplete="tel"
          />
        </div>
      ) : null}

      {!preview && step === 4 ? (
        <div>
          <label className={labelClass} htmlFor="g4">
            Location
          </label>
          <input
            id="g4"
            className={inputClass}
            value={content.contact.location ?? ""}
            onChange={(e) =>
              setContent((c) => ({ ...c, contact: { ...c.contact, location: e.target.value } }))
            }
            autoFocus
            autoComplete="address-level1"
          />
        </div>
      ) : null}

      {!preview && step === 5 ? (
        <div>
          <label className={labelClass} htmlFor="g5">
            Target job title
          </label>
          <input
            id="g5"
            className={inputClass}
            value={content.target.jobTitle ?? ""}
            onChange={(e) =>
              setContent((c) => ({ ...c, target: { ...c.target, jobTitle: e.target.value } }))
            }
            autoFocus
          />
        </div>
      ) : null}

      {!preview && step === 6 ? (
        <div>
          <label className={labelClass} htmlFor="g6">
            Job title
          </label>
          <input
            id="g6"
            className={inputClass}
            value={readJ0(content)?.title ?? ""}
            onChange={(e) => {
              setContent((c) => withJ0(c, (j) => ({ ...j, title: e.target.value })));
            }}
            autoFocus
          />
        </div>
      ) : null}

      {!preview && step === 7 ? (
        <div>
          <label className={labelClass} htmlFor="g7">
            Company
          </label>
          <input
            id="g7"
            className={inputClass}
            value={readJ0(content)?.employer ?? ""}
            onChange={(e) => {
              setContent((c) => withJ0(c, (j) => ({ ...j, employer: e.target.value })));
            }}
            autoFocus
          />
        </div>
      ) : null}

      {!preview && step === 8 ? (
        <div>
          <label className={labelClass} htmlFor="g8">
            Start
          </label>
          <input
            id="g8"
            className={inputClass}
            value={readJ0(content)?.startDate ?? ""}
            onChange={(e) => {
              setContent((c) => withJ0(c, (j) => ({ ...j, startDate: e.target.value })));
            }}
            autoFocus
          />
        </div>
      ) : null}

      {!preview && step === 9 ? (
        <div className="space-y-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
            <input
              type="checkbox"
              className="size-4 rounded"
              checked={cur}
              onChange={(e) => {
                setCur(e.target.checked);
                if (e.target.checked) {
                  setEndIn("");
                }
              }}
            />
            I currently work here
          </label>
          {!cur ? (
            <div>
              <label className={labelClass} htmlFor="g9e">
                End date
              </label>
              <input
                id="g9e"
                className={inputClass}
                value={endIn}
                onChange={(e) => setEndIn(e.target.value)}
                placeholder="e.g. 2024-06"
                autoFocus
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {!preview && step === 10 ? (
        <div>
          <label className={labelClass} htmlFor="g10">
            Responsibilities and wins
          </label>
          <textarea
            id="g10"
            className={textareaClass}
            rows={8}
            value={duty}
            onChange={(e) => setDuty(e.target.value)}
            autoFocus
            placeholder="Led a team of…  Increased revenue by…"
          />
        </div>
      ) : null}

      {!preview && step === 11 ? (
        <div>
          <label className={labelClass} htmlFor="g11">
            School
          </label>
          <input
            id="g11"
            className={inputClass}
            value={content.education.items[0]?.institution ?? ""}
            onChange={(e) => {
              setContent((c) => {
                const u = { ...c };
                const ed = c.education.items[0] ?? { id: newId(), institution: "" };
                u.education = {
                  items: [{ ...ed, institution: e.target.value }, ...c.education.items.slice(1)],
                };
                return u;
              });
            }}
            autoFocus
          />
        </div>
      ) : null}

      {!preview && step === 12 ? (
        <div>
          <label className={labelClass} htmlFor="g12">
            Degree
          </label>
          <input
            id="g12"
            className={inputClass}
            value={deg}
            onChange={(e) => setDeg(e.target.value)}
            autoFocus
            placeholder="e.g. B.S. Computer Science"
          />
        </div>
      ) : null}

      {!preview && step === 13 ? (
        <div>
          <label className={labelClass} htmlFor="g13">
            Skills
          </label>
          <textarea
            id="g13"
            className={textareaClass}
            rows={4}
            value={sk}
            onChange={(e) => setSk(e.target.value)}
            autoFocus
            placeholder="Python, SQL, Leadership, …"
          />
        </div>
      ) : null}

      <div className="sticky bottom-0 z-10 -mx-1 flex flex-col gap-2 border-t border-zinc-200/90 bg-zinc-50/95 p-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-0">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
          <button
            type="button"
            className={btnSecondary}
            onClick={goBack}
            disabled={preview || (step <= 0 && step !== DONE) || aiBusy}
          >
            Back
          </button>
          {step < DONE && !preview ? (
            <button
              type="button"
              className={btnPrimary}
              onClick={goNext}
              disabled={aiBusy}
            >
              Continue
            </button>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:justify-end sm:gap-2">
          <button
            type="button"
            className={btnSecondary}
            onClick={() => {
              setAiErr(null);
              setPreview((p) => !p);
            }}
            disabled={aiBusy}
          >
            {preview ? "Back to questions" : "Preview resume"}
          </button>
          <button
            type="button"
            className={`${btnPrimary} ${!canAi ? "opacity-50" : ""}`}
            onClick={runAi}
            disabled={aiBusy || !canAi}
            title={!canAi ? "Add a target job or experience first" : undefined}
          >
            {aiBusy ? "AI working…" : "AI generate resume"}
          </button>
        </div>
      </div>
    </div>
  );
}
