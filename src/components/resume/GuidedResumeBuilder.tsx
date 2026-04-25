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
import {
  isForkScreen,
  nextLinearScreen,
  previousScreen,
  progressLine,
  type GuidedScreen,
} from "@/lib/builder/guided-cursor";
import { newId } from "@/lib/id";
import {
  defaultDraftTitle,
  saveLocalResumeDraft,
  type PublicBuilderUi,
} from "@/lib/resume/local-draft";
import {
  normalizeResumeContent,
  type EducationItem,
  type ExperienceItem,
  type ResumeContent,
} from "@/lib/resume/types";

const AUTOSAVE_MS = 500;
const SAVED_MSG_MS = 2000;

type SaveS = "idle" | "saving" | "saved";

type Props = {
  initialContent: ResumeContent;
  initialScreen: GuidedScreen;
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

function readJob(c: ResumeContent, i: number): ExperienceItem | undefined {
  return c.experience.items[i];
}

function withJob(
  c: ResumeContent,
  idx: number,
  map: (j: ExperienceItem) => ExperienceItem,
): ResumeContent {
  const items = c.experience.items.map((x) => ({ ...x, bullets: x.bullets.map((b) => ({ ...b })) }));
  while (items.length <= idx) {
    items.push({ id: newId(), employer: "", title: "", bullets: [] });
  }
  items[idx] = map({ ...items[idx]! });
  return { ...c, experience: { items } };
}

function readEdu(
  c: ResumeContent,
  i: number,
):
  | import("@/lib/resume/types").EducationItem
  | undefined {
  return c.education.items[i];
}

function withEdu(
  c: ResumeContent,
  idx: number,
  map: (e: import("@/lib/resume/types").EducationItem) => import("@/lib/resume/types").EducationItem,
): ResumeContent {
  const items = c.education.items.map((e) => ({ ...e }));
  while (items.length <= idx) {
    items.push({ id: newId(), institution: "" });
  }
  items[idx] = map({ ...items[idx]! });
  return { ...c, education: { items } };
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

function mainQuestion(screen: GuidedScreen): { text: string; optional?: true } {
  if (screen.kind === "name") {
    if (screen.n === 0) {
      return { text: "What’s your first name?" };
    }
    return { text: "What’s your last name?" };
  }
  if (screen.kind === "contact") {
    if (screen.n === 0) {
      return { text: "What email should we show?" };
    }
    if (screen.n === 1) {
      return { text: "What’s the best phone number?" };
    }
    return { text: "What city and state are you in? (e.g. Austin, TX)" };
  }
  if (screen.kind === "target") {
    return { text: "What job title are you going for next?" };
  }
  if (screen.kind === "job") {
    if (screen.n === 0) {
      return {
        text:
          screen.jobIndex === 0
            ? "What was your most recent job title?"
            : "What was your job title?",
      };
    }
    if (screen.n === 1) {
      return { text: "What company was that for?" };
    }
    if (screen.n === 2) {
      return { text: "When did you start? (e.g. 2020-01)" };
    }
    if (screen.n === 3) {
      return { text: "End date, or is it a current role?" };
    }
    return { text: "What did you do there? (one line per bullet point)" };
  }
  if (screen.kind === "jobFork") {
    return { text: "Would you like to add another job?" };
  }
  if (screen.kind === "edu") {
    if (screen.n === 0) {
      return { text: "Where did you go to school?", optional: true };
    }
    return { text: "Degree and major (if you want them shown)", optional: true };
  }
  if (screen.kind === "eduFork") {
    return { text: "Would you like to add another school?" };
  }
  if (screen.kind === "skills") {
    return { text: "List your top skills, separated by commas" };
  }
  return { text: "Nice work" };
}

type Locals = {
  nameA: string;
  nameB: string;
  endIn: string;
  cur: boolean;
  duty: string;
  deg: string;
  sk: string;
};

function commitOnContinue(
  s: GuidedScreen,
  c: ResumeContent,
  l: Locals,
): ResumeContent {
  let n: ResumeContent = {
    ...c,
    contact: { ...c.contact, links: c.contact.links ?? [] },
    target: { ...c.target },
    summary: { ...c.summary },
    experience: {
      items: c.experience.items.map((i) => ({ ...i, bullets: i.bullets.map((b) => ({ ...b })) })),
    },
    skills: { groups: c.skills.groups.map((g) => ({ ...g, items: [...g.items] })) },
    education: { items: c.education.items.map((e) => ({ ...e })) },
    meta: { ...c.meta },
  };

  if (s.kind === "name" && s.n === 1) {
    n.contact = { ...n.contact, fullName: joinName(l.nameA, l.nameB) };
  }
  if (s.kind === "job" && s.n === 3) {
    const it = readJob(n, s.jobIndex) ?? {
      id: newId(),
      employer: "",
      title: "",
      bullets: [],
    };
    const it2 = { ...it };
    it2.endDate = l.cur
      ? null
      : tr(l.endIn) === ""
        ? null
        : tr(l.endIn);
    n = withJob(n, s.jobIndex, () => it2);
  }
  if (s.kind === "job" && s.n === 4) {
    const it = readJob(n, s.jobIndex) ?? {
      id: newId(),
      employer: "",
      title: "",
      bullets: [],
    };
    const lines = tr(l.duty)
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
    const it2 = { ...it, bullets: lines.length ? lines.map((t) => ({ id: newId(), text: t })) : [] };
    n = withJob(n, s.jobIndex, () => it2);
  }
  if (s.kind === "edu" && s.n === 1) {
    const p = tr(l.deg);
    n = withEdu(n, s.eduIndex, (e) => ({ ...e, degree: p || undefined, field: undefined }));
  }
  if (s.kind === "skills") {
    const items = tr(l.sk)
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    n.skills = {
      groups: items.length
        ? [{ id: n.skills.groups[0]?.id ?? newId(), name: "Skills", items }]
        : [],
    };
  }
  return n;
}

function syncAllLocals(
  c: ResumeContent,
  setters: {
    setNameA: (v: string) => void;
    setNameB: (v: string) => void;
    setEndIn: (v: string) => void;
    setCur: (v: boolean) => void;
    setDuty: (v: string) => void;
    setDeg: (v: string) => void;
    setSk: (v: string) => void;
  },
  screen: GuidedScreen,
) {
  setters.setNameA(splitName(c.contact.fullName ?? "").a);
  setters.setNameB(splitName(c.contact.fullName ?? "").b);
  setters.setSk((c.skills.groups[0]?.items ?? []).join(", "));

  if (screen.kind === "job") {
    const j = readJob(c, screen.jobIndex);
    if (j) {
      setters.setCur(j.endDate === null);
      setters.setEndIn(
        j.endDate == null || j.endDate === null ? "" : String(j.endDate),
      );
      setters.setDuty((j.bullets ?? []).map((b) => b.text).join("\n"));
    }
  }

  if (screen.kind === "edu") {
    const e = readEdu(c, screen.eduIndex);
    setters.setDeg([e?.degree, e?.field].filter(Boolean).join(" — "));
  }
}

export function GuidedResumeBuilder({
  initialContent,
  initialScreen,
  onStartOver,
  storageKey,
}: Props) {
  const [content, setContent] = useState<ResumeContent>(initialContent);
  const [screen, setScreen] = useState<GuidedScreen>(initialScreen);
  const [saveState, setSaveS] = useState<SaveS>("idle");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiErr, setAiErr] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [entPdf, setEntPdf] = useState<boolean | null>(null);
  const [nameA, setNameA] = useState(() => splitName(initialContent.contact.fullName ?? "").a);
  const [nameB, setNameB] = useState(() => splitName(initialContent.contact.fullName ?? "").b);
  const [endIn, setEndIn] = useState("");
  const [cur, setCur] = useState(false);
  const [duty, setDuty] = useState("");
  const [deg, setDeg] = useState("");
  const [sk, setSk] = useState(() =>
    (initialContent.skills.groups[0]?.items ?? []).join(", "),
  );

  const g = useRef(0);
  const tmr = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevJ = useRef<string>("");
  const prevE = useRef<string>("");

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

  const expCount = content.experience.items.length;
  const eduCount = content.education.items.length;
  const counts = { experienceCount: expCount, educationCount: eduCount };
  const backTarget = previousScreen(screen, counts);
  const canBack = !preview && !aiBusy && backTarget != null;
  const interview = screen.kind !== "done" && !preview;
  const showContinue =
    !preview && screen.kind !== "done" && !isForkScreen(screen);

  const locals: Locals = { nameA, nameB, endIn, cur, duty, deg, sk };

  // Sync end/duty when entering a job’s date or duties step
  useEffect(() => {
    if (screen.kind !== "job" || (screen.n !== 3 && screen.n !== 4)) {
      return;
    }
    const jk = `j${screen.jobIndex}-${screen.n}`;
    if (prevJ.current === jk) {
      return;
    }
    prevJ.current = jk;
    const j = readJob(content, screen.jobIndex);
    if (!j) {
      return;
    }
    if (screen.n === 3) {
      setCur(j.endDate === null);
      setEndIn(
        j.endDate == null || j.endDate === null
          ? ""
          : String(j.endDate),
      );
    } else {
      setDuty((j.bullets ?? []).map((b) => b.text).join("\n"));
    }
  }, [screen, content.experience.items]);

  useEffect(() => {
    if (screen.kind !== "edu" || screen.n !== 1) {
      return;
    }
    const ek = `e${screen.eduIndex}-1`;
    if (prevE.current === ek) {
      return;
    }
    prevE.current = ek;
    const e = readEdu(content, screen.eduIndex);
    setDeg([e?.degree, e?.field].filter(Boolean).join(" — "));
  }, [screen, content.education.items]);

  useEffect(() => {
    if (screen.kind === "job" && screen.n >= 3) {
      return;
    }
    if (screen.kind === "job" && screen.n < 3) {
      prevJ.current = "";
    }
  }, [screen]);

  useEffect(() => {
    if (screen.kind !== "edu" || screen.n === 0) {
      if (screen.kind === "edu") {
        prevE.current = "";
      }
    }
  }, [screen]);

  const doSave = useCallback(() => {
    const x = ++g.current;
    setSaveS("saving");
    const jIdx = screen.kind === "job" ? screen.jobIndex : undefined;
    const eIdx = screen.kind === "edu" ? screen.eduIndex : undefined;
    const ui: PublicBuilderUi = {
      phase: screen.kind === "done" ? "done" : "interview",
      v: 2,
      screen,
      ...(jIdx !== undefined ? { jobIndex: jIdx } : {}),
      ...(eIdx !== undefined ? { educationIndex: eIdx } : {}),
    };
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
  }, [content, screen, storageKey]);

  useEffect(() => {
    const t = setTimeout(doSave, AUTOSAVE_MS);
    return () => clearTimeout(t);
  }, [content, screen, doSave]);

  useEffect(() => {
    if (screen.kind === "job" && screen.n <= 3) {
      setContent((c) => {
        if (c.experience.items.length > screen.jobIndex) {
          return c;
        }
        return withJob(c, screen.jobIndex, (j) => j);
      });
    }
  }, [screen]);

  useEffect(() => {
    if (screen.kind === "edu" && screen.n === 0) {
      setContent((c) => {
        if (c.education.items.length > screen.eduIndex) {
          return c;
        }
        return withEdu(c, screen.eduIndex, (e) => e);
      });
    }
  }, [screen]);

  const ex = (entPdf === true ? "allowed" : entPdf === false ? "denied" : "pending") as
    | "allowed"
    | "pending"
    | "denied";
  const canAi = canRunPartialAiFill(content);

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
      syncAllLocals(
        n,
        {
          setNameA,
          setNameB,
          setEndIn,
          setCur,
          setDuty,
          setDeg,
          setSk,
        },
        screen,
      );
      prevJ.current = "";
      prevE.current = "";
    } catch {
      setAiErr("Network error. Try again.");
    } finally {
      setAiBusy(false);
    }
  };

  const goNext = () => {
    if (aiBusy || isForkScreen(screen) || screen.kind === "done" || preview) {
      return;
    }
    setContent((c) => {
      const n = commitOnContinue(screen, c, locals);
      const nxt = nextLinearScreen(screen, {
        experienceCount: n.experience.items.length,
        educationCount: n.education.items.length,
      });
      setScreen(nxt);
      return n;
    });
  };

  const goBack = () => {
    if (aiBusy) {
      return;
    }
    if (preview) {
      return;
    }
    const p = previousScreen(screen, {
      experienceCount: content.experience.items.length,
      educationCount: content.education.items.length,
    });
    if (!p) {
      return;
    }
    setScreen(p);
    prevJ.current = "";
    prevE.current = "";
  };

  const onAddAnotherJob = () => {
    if (aiBusy) {
      return;
    }
    setContent((c) => {
      const items: typeof c.experience.items = [
        ...c.experience.items,
        { id: newId(), employer: "", title: "", bullets: [] },
      ];
      setScreen({ kind: "job", jobIndex: items.length - 1, n: 0 });
      return { ...c, experience: { items } };
    });
  };

  const onContinueToEducation = () => {
    if (aiBusy) {
      return;
    }
    setContent((c) => {
      if (c.education.items.length) {
        setScreen({ kind: "edu", eduIndex: 0, n: 0 });
        return c;
      }
      const items = [{ id: newId(), institution: "" }, ...c.education.items];
      setScreen({ kind: "edu", eduIndex: 0, n: 0 });
      return { ...c, education: { items } };
    });
  };

  const onAddAnotherSchool = () => {
    if (aiBusy) {
      return;
    }
    setContent((c) => {
      const items: typeof c.education.items = [
        ...c.education.items,
        { id: newId(), institution: "" },
      ];
      setScreen({ kind: "edu", eduIndex: items.length - 1, n: 0 });
      return { ...c, education: { items } };
    });
  };

  const onContinueToSkills = () => {
    if (aiBusy) {
      return;
    }
    setScreen({ kind: "skills" });
  };

  const mq = mainQuestion(screen);
  const pl = progressLine(screen);

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

      {interview && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {pl}
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {mq.text}
            {mq.optional ? (
              <span className="text-sm font-normal text-zinc-500"> (optional)</span>
            ) : null}
          </h2>
        </div>
      )}

      {screen.kind === "done" && !preview ? (
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

      {interview && screen.kind === "name" && screen.n === 0 ? (
        <div>
          <label className={labelClass} htmlFor="g-n0">
            First name
          </label>
          <input
            id="g-n0"
            className={inputClass}
            value={nameA}
            onChange={(e) => setNameA(e.target.value)}
            autoFocus
            autoComplete="given-name"
          />
        </div>
      ) : null}

      {interview && screen.kind === "name" && screen.n === 1 ? (
        <div>
          <label className={labelClass} htmlFor="g-n1">
            Last name
          </label>
          <input
            id="g-n1"
            className={inputClass}
            value={nameB}
            onChange={(e) => setNameB(e.target.value)}
            autoFocus
            autoComplete="family-name"
          />
        </div>
      ) : null}

      {interview && screen.kind === "contact" && screen.n === 0 ? (
        <div>
          <label className={labelClass} htmlFor="g-c0">
            Email
          </label>
          <input
            id="g-c0"
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

      {interview && screen.kind === "contact" && screen.n === 1 ? (
        <div>
          <label className={labelClass} htmlFor="g-c1">
            Phone
          </label>
          <input
            id="g-c1"
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

      {interview && screen.kind === "contact" && screen.n === 2 ? (
        <div>
          <label className={labelClass} htmlFor="g-c2">
            Location
          </label>
          <input
            id="g-c2"
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

      {interview && screen.kind === "target" ? (
        <div>
          <label className={labelClass} htmlFor="g-t">
            Target job title
          </label>
          <input
            id="g-t"
            className={inputClass}
            value={content.target.jobTitle ?? ""}
            onChange={(e) =>
              setContent((c) => ({ ...c, target: { ...c.target, jobTitle: e.target.value } }))
            }
            autoFocus
          />
        </div>
      ) : null}

      {interview && screen.kind === "job" && screen.n === 0 ? (
        <div>
          <label className={labelClass} htmlFor="g-jt0">
            Job title
          </label>
          <input
            id="g-jt0"
            className={inputClass}
            value={readJob(content, screen.jobIndex)?.title ?? ""}
            onChange={(e) => {
              setContent((c) => withJob(c, screen.jobIndex, (j) => ({ ...j, title: e.target.value })));
            }}
            autoFocus
          />
        </div>
      ) : null}

      {interview && screen.kind === "job" && screen.n === 1 ? (
        <div>
          <label className={labelClass} htmlFor="g-j1">
            Company
          </label>
          <input
            id="g-j1"
            className={inputClass}
            value={readJob(content, screen.jobIndex)?.employer ?? ""}
            onChange={(e) => {
              setContent((c) => withJob(c, screen.jobIndex, (j) => ({ ...j, employer: e.target.value })));
            }}
            autoFocus
          />
        </div>
      ) : null}

      {interview && screen.kind === "job" && screen.n === 2 ? (
        <div>
          <label className={labelClass} htmlFor="g-j2">
            Start
          </label>
          <input
            id="g-j2"
            className={inputClass}
            value={readJob(content, screen.jobIndex)?.startDate ?? ""}
            onChange={(e) => {
              setContent((c) => withJob(c, screen.jobIndex, (j) => ({ ...j, startDate: e.target.value })));
            }}
            autoFocus
          />
        </div>
      ) : null}

      {interview && screen.kind === "job" && screen.n === 3 ? (
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
              <label className={labelClass} htmlFor="g-je">
                End date
              </label>
              <input
                id="g-je"
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

      {interview && screen.kind === "job" && screen.n === 4 ? (
        <div>
          <label className={labelClass} htmlFor="g-jd">
            Responsibilities and wins
          </label>
          <textarea
            id="g-jd"
            className={textareaClass}
            rows={8}
            value={duty}
            onChange={(e) => setDuty(e.target.value)}
            autoFocus
            placeholder="Led a team of…  Increased revenue by…"
          />
        </div>
      ) : null}

      {interview && screen.kind === "jobFork" ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            className={btnPrimary}
            onClick={onAddAnotherJob}
            disabled={aiBusy}
          >
            Add another job
          </button>
          <button
            type="button"
            className={btnSecondary}
            onClick={onContinueToEducation}
            disabled={aiBusy}
          >
            Continue to education
          </button>
        </div>
      ) : null}

      {interview && screen.kind === "edu" && screen.n === 0 ? (
        <div>
          <label className={labelClass} htmlFor="g-e0">
            School
          </label>
          <input
            id="g-e0"
            className={inputClass}
            value={readEdu(content, screen.eduIndex)?.institution ?? ""}
            onChange={(e) => {
              setContent((c) =>
                withEdu(c, screen.eduIndex, (ed) => ({ ...ed, institution: e.target.value })),
              );
            }}
            autoFocus
          />
        </div>
      ) : null}

      {interview && screen.kind === "edu" && screen.n === 1 ? (
        <div>
          <label className={labelClass} htmlFor="g-e1">
            Degree
          </label>
          <input
            id="g-e1"
            className={inputClass}
            value={deg}
            onChange={(e) => setDeg(e.target.value)}
            autoFocus
            placeholder="e.g. B.S. Computer Science"
          />
        </div>
      ) : null}

      {interview && screen.kind === "eduFork" ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            className={btnPrimary}
            onClick={onAddAnotherSchool}
            disabled={aiBusy}
          >
            Add another school
          </button>
          <button
            type="button"
            className={btnSecondary}
            onClick={onContinueToSkills}
            disabled={aiBusy}
          >
            Continue to skills
          </button>
        </div>
      ) : null}

      {interview && screen.kind === "skills" ? (
        <div>
          <label className={labelClass} htmlFor="g-sk">
            Skills
          </label>
          <textarea
            id="g-sk"
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
            disabled={!canBack}
          >
            Back
          </button>
          {showContinue ? (
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
