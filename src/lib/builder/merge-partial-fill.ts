import { ensureAllResumeIds } from "@/lib/resume/ensure-resume-ids";
import type { ExperienceBullet, ResumeContent } from "@/lib/resume/types";

function t(s: string | undefined | null): string {
  return (s ?? "").trim();
}

/**
 * Merges AI "fill" output into the user's draft. Factual/identity fields always
 * stay on the user; summary/skills/bullets can be taken from the AI.
 */
export function mergePartialFill(user: ResumeContent, ai: ResumeContent): ResumeContent {
  const out = ensureAllResumeIds(
    JSON.parse(JSON.stringify(user)) as ResumeContent,
  );

  if (!t(out.summary.text) && t(ai.summary.text)) {
    out.summary = { text: t(ai.summary.text) };
  }

  const hasUserSkills = out.skills.groups.some(
    (g) => t(g.name) && g.items.some((i) => t(i)),
  );
  if (!hasUserSkills && ai.skills.groups.length > 0) {
    out.skills = { groups: structuredClone(ai.skills.groups) };
  }

  out.experience.items = out.experience.items.map((u, i) => {
    const a = ai.experience.items[i];
    if (!a) {
      return u;
    }
    const nextBullets: ExperienceBullet[] = u.bullets.map((b, j) => {
      const ab = a.bullets[j];
      if (!ab) {
        return b;
      }
      const at = t(ab.text);
      return { ...b, text: at || t(b.text) || b.text };
    });
    for (let j = u.bullets.length; j < a.bullets.length; j += 1) {
      if (t(a.bullets[j]!.text)) {
        nextBullets.push({ ...a.bullets[j]! });
      }
    }
    return {
      ...u,
      employer: t(u.employer),
      title: t(u.title),
      bullets: nextBullets,
    };
  });

  return ensureAllResumeIds(out);
}

export function canRunPartialAiFill(c: ResumeContent): boolean {
  if (t(c.target.jobTitle)) {
    return true;
  }
  for (const job of c.experience.items) {
    if (t(job.employer) || t(job.title)) {
      return true;
    }
    for (const b of job.bullets) {
      if (t(b.text)) {
        return true;
      }
    }
  }
  return false;
}
