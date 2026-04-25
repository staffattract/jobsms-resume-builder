/**
 * ResumeBlues guided builder: screen state and navigation (v2).
 * Persist `GuidedScreen` in localStorage to restore position.
 */

export type GuidedScreen =
  | { kind: "name"; n: 0 | 1 }
  | { kind: "contact"; n: 0 | 1 | 2 }
  | { kind: "target" }
  | { kind: "job"; jobIndex: number; n: 0 | 1 | 2 | 3 | 4 }
  | { kind: "jobFork"; afterJobIndex: number }
  | { kind: "edu"; eduIndex: number; n: 0 | 1 }
  | { kind: "eduFork"; afterEduIndex: number }
  | { kind: "skills" }
  | { kind: "done" };

export const GUIDED_VERSION = 2 as const;

export function defaultScreen(): GuidedScreen {
  return { kind: "name", n: 0 };
}

/** Recursively compute the previous screen (back button). */
export function previousScreen(
  s: GuidedScreen,
  c: { experienceCount: number; educationCount: number },
): GuidedScreen | null {
  if (s.kind === "name" && s.n === 0) {
    return null;
  }
  if (s.kind === "name" && s.n === 1) {
    return { kind: "name", n: 0 };
  }
  if (s.kind === "contact") {
    if (s.n === 0) {
      return { kind: "name", n: 1 };
    }
    if (s.n === 1) {
      return { kind: "contact", n: 0 };
    }
    return { kind: "contact", n: 1 };
  }
  if (s.kind === "target") {
    return { kind: "contact", n: 2 };
  }
  if (s.kind === "job") {
    if (s.n > 0) {
      return { kind: "job", jobIndex: s.jobIndex, n: (s.n - 1) as 0 | 1 | 2 | 3 | 4 };
    }
    if (s.jobIndex === 0) {
      return { kind: "target" };
    }
    return { kind: "jobFork", afterJobIndex: s.jobIndex - 1 };
  }
  if (s.kind === "jobFork") {
    return { kind: "job", jobIndex: s.afterJobIndex, n: 4 };
  }
  if (s.kind === "edu") {
    if (s.n > 0) {
      return { kind: "edu", eduIndex: s.eduIndex, n: 0 };
    }
    if (s.eduIndex === 0) {
      return {
        kind: "jobFork",
        afterJobIndex: Math.max(0, c.experienceCount - 1),
      };
    }
    return { kind: "eduFork", afterEduIndex: s.eduIndex - 1 };
  }
  if (s.kind === "eduFork") {
    return { kind: "edu", eduIndex: s.afterEduIndex, n: 1 };
  }
  if (s.kind === "skills") {
    if (c.educationCount > 0) {
      return {
        kind: "eduFork",
        afterEduIndex: c.educationCount - 1,
      };
    }
    return { kind: "jobFork", afterJobIndex: Math.max(0, c.experienceCount - 1) };
  }
  if (s.kind === "done") {
    return { kind: "skills" };
  }
  return null;
}

/** One Continue step (linear part only; forks use explicit handlers). */
export function nextLinearScreen(
  s: GuidedScreen,
  c: { experienceCount: number; educationCount: number },
): GuidedScreen {
  if (s.kind === "name" && s.n === 0) {
    return { kind: "name", n: 1 };
  }
  if (s.kind === "name" && s.n === 1) {
    return { kind: "contact", n: 0 };
  }
  if (s.kind === "contact" && s.n < 2) {
    return { kind: "contact", n: (s.n + 1) as 0 | 1 | 2 };
  }
  if (s.kind === "contact" && s.n === 2) {
    return { kind: "target" };
  }
  if (s.kind === "target") {
    return { kind: "job", jobIndex: 0, n: 0 };
  }
  if (s.kind === "job" && s.n < 4) {
    return { kind: "job", jobIndex: s.jobIndex, n: (s.n + 1) as 0 | 1 | 2 | 3 | 4 };
  }
  if (s.kind === "job" && s.n === 4) {
    return { kind: "jobFork", afterJobIndex: s.jobIndex };
  }
  if (s.kind === "edu" && s.n === 0) {
    return { kind: "edu", eduIndex: s.eduIndex, n: 1 };
  }
  if (s.kind === "edu" && s.n === 1) {
    return { kind: "eduFork", afterEduIndex: s.eduIndex };
  }
  if (s.kind === "skills") {
    return { kind: "done" };
  }
  // Fallback: stay (forks not linear)
  return s;
}

/** Map legacy 0..14 single-job flow to v2. */
export function migrateLegacyStep(step: number, done: boolean): GuidedScreen {
  if (done || step >= 15) {
    return { kind: "done" };
  }
  if (step === 0) {
    return { kind: "name", n: 0 };
  }
  if (step === 1) {
    return { kind: "name", n: 1 };
  }
  if (step >= 2 && step <= 4) {
    return { kind: "contact", n: (step - 2) as 0 | 1 | 2 };
  }
  if (step === 5) {
    return { kind: "target" };
  }
  if (step >= 6 && step <= 9) {
    return { kind: "job", jobIndex: 0, n: (step - 6) as 0 | 1 | 2 | 3 };
  }
  if (step === 10) {
    return { kind: "job", jobIndex: 0, n: 4 };
  }
  if (step === 11) {
    return { kind: "edu", eduIndex: 0, n: 0 };
  }
  if (step === 12) {
    return { kind: "edu", eduIndex: 0, n: 1 };
  }
  if (step === 13) {
    return { kind: "skills" };
  }
  return { kind: "done" };
}

export function progressLine(s: GuidedScreen): string {
  if (s.kind === "name") {
    return s.n === 0 ? "Name — first" : "Name — last";
  }
  if (s.kind === "contact") {
    const t = ["Email", "Phone", "Location"] as const;
    return `Contact — ${t[s.n]}`;
  }
  if (s.kind === "target") {
    return "Target role";
  }
  if (s.kind === "job") {
    const parts = [
      "title",
      "company",
      "start",
      "end",
      "responsibilities",
    ] as const;
    return `Job ${s.jobIndex + 1} — ${parts[s.n]}`;
  }
  if (s.kind === "jobFork") {
    return `After job ${s.afterJobIndex + 1}`;
  }
  if (s.kind === "edu") {
    const t = ["School", "Degree"] as const;
    return `Education ${s.eduIndex + 1} — ${t[s.n]}`;
  }
  if (s.kind === "eduFork") {
    return `After school ${s.afterEduIndex + 1}`;
  }
  if (s.kind === "skills") {
    return "Skills";
  }
  return "Done";
}

export function isForkScreen(s: GuidedScreen): boolean {
  return s.kind === "jobFork" || s.kind === "eduFork";
}
