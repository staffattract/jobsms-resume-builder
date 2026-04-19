import { newId } from "@/lib/id";
import type { ResumeContent } from "@/lib/resume/types";

/** Ensures every nested entity has an `id` so editor steps and saves work reliably. */
export function ensureAllResumeIds(content: ResumeContent): ResumeContent {
  const c = structuredClone(content);
  for (const link of c.contact.links) {
    if (!link.id?.trim()) link.id = newId();
  }
  for (const item of c.experience.items) {
    if (!item.id?.trim()) item.id = newId();
    for (const b of item.bullets) {
      if (!b.id?.trim()) b.id = newId();
    }
  }
  for (const g of c.skills.groups) {
    if (!g.id?.trim()) g.id = newId();
  }
  for (const e of c.education.items) {
    if (!e.id?.trim()) e.id = newId();
  }
  return c;
}
