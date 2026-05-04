import { MAX_BULLET_CHARS } from "@/lib/ai/limits";
import { ensureAllResumeIds } from "@/lib/resume/ensure-resume-ids";
import type { ExperienceBullet, ResumeContent } from "@/lib/resume/types";

function t(s: string | undefined | null): string {
  return (s ?? "").trim();
}

function clampBullet(text: string): string {
  if (text.length <= MAX_BULLET_CHARS) {
    return text;
  }
  return text.slice(0, MAX_BULLET_CHARS);
}

/**
 * Merges AI "fill" output into the user's draft. Factual/identity fields always
 * stay on the user; summary/skills/bullets can be taken from the AI.
 *
 * Never appends AI-only bullets beyond the user's bullet count — prevents
 * hallucinated extra accomplishments.
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
      const at = clampBullet(t(ab.text));
      const userTxt = t(b.text);
      if (!userTxt && at) {
        return { ...b, text: at };
      }
      return {
        ...b,
        text: clampBullet(at || userTxt || b.text),
      };
    });
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
