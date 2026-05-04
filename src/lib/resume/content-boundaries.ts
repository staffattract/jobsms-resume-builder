import { MAX_BULLET_CHARS } from "@/lib/ai/limits";
import type {
  ResumeContent,
  ResumeMeta,
  ResumeSummary,
  ResumeTarget,
  ResumeContact,
} from "@/lib/resume/types";

/** Hard caps keep UI, preview, PDF, and storage predictable after AI ingestion. */

export const MAX_STORED_RESUME_SUMMARY_CHARS = 10_000;
export const MAX_STORED_TARGET_FIELD_CHARS = 400;
export const MAX_STORED_CONTACT_FIELD_CHARS = 600;
export const MAX_STORED_URL_CHARS = 2_048;
export const MAX_STORED_LINK_LABEL_CHARS = 200;
export const MAX_STORED_CONTACT_LINKS = 24;
export const MAX_STORED_SKILL_GROUP_ITEMS = 60;
export const MAX_STORED_SKILL_GROUPS = 32;
export const MAX_STORED_SKILL_ITEM_CHARS = 240;
export const MAX_STORED_GROUP_NAME_CHARS = 120;

export const MAX_STORED_EMPLOYER_TITLE_CHARS = 500;
export const MAX_STORED_LOCATION_CHARS = 400;
export const MAX_STORED_DATE_FIELD_CHARS = 80;
export const MAX_STORED_EXPERIENCE_ITEMS = 32;
export const MAX_STORED_BULLETS_PER_ROLE = 28;

export const MAX_STORED_EDUCATION_ITEMS = 20;
export const MAX_STORED_INSTITUTION_CHARS = 400;
export const MAX_STORED_DEGREE_FIELD_CHARS = 300;
export const MAX_STORED_EDUCATION_DETAILS_CHARS = 4_000;

function clip(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max);
}

function clipOpt(s: string | undefined, max: number): string | undefined {
  if (s === undefined) return undefined;
  const t = s.trim();
  if (!t) return undefined;
  return clip(t, max);
}

/** Defensive copy with string/array bounds so malformed AI output cannot blow up rendering. */
export function clampResumeContentDeep(content: ResumeContent): ResumeContent {
  const c = structuredClone(content);

  c.contact = clampContact(c.contact);
  c.target = clampTarget(c.target);
  c.summary = clampSummary(c.summary);
  c.experience.items = clampExperienceItems(c.experience.items);
  c.skills.groups = clampSkillGroups(c.skills.groups);
  c.education.items = clampEducationItems(c.education.items);
  c.meta = clampMeta(c.meta);

  return c;
}

function clampContact(contact: ResumeContact): ResumeContact {
  return {
    fullName: clipOpt(contact.fullName, MAX_STORED_CONTACT_FIELD_CHARS),
    email: clipOpt(contact.email, MAX_STORED_CONTACT_FIELD_CHARS),
    phone: clipOpt(contact.phone, MAX_STORED_CONTACT_FIELD_CHARS),
    location: clipOpt(contact.location, MAX_STORED_CONTACT_FIELD_CHARS),
    links: (contact.links ?? [])
      .slice(0, MAX_STORED_CONTACT_LINKS)
      .map((l) => ({
        id: l.id,
        label: clipOpt(l.label, MAX_STORED_LINK_LABEL_CHARS),
        url: clipOpt(l.url, MAX_STORED_URL_CHARS),
      })),
  };
}

function clampTarget(t: ResumeTarget): ResumeTarget {
  return {
    jobTitle: clipOpt(t.jobTitle, MAX_STORED_TARGET_FIELD_CHARS),
    company: clipOpt(t.company, MAX_STORED_TARGET_FIELD_CHARS),
    notes: clipOpt(t.notes, MAX_STORED_TARGET_FIELD_CHARS),
  };
}

function clampSummary(s: ResumeSummary): ResumeSummary {
  return {
    text: clip(s.text ?? "", MAX_STORED_RESUME_SUMMARY_CHARS),
  };
}

function clampExperienceItems(
  items: ResumeContent["experience"]["items"],
): ResumeContent["experience"]["items"] {
  return items.slice(0, MAX_STORED_EXPERIENCE_ITEMS).map((job) => ({
    ...job,
    employer: clip(job.employer ?? "", MAX_STORED_EMPLOYER_TITLE_CHARS) || "—",
    title: clip(job.title ?? "", MAX_STORED_EMPLOYER_TITLE_CHARS),
    location: clipOpt(job.location, MAX_STORED_LOCATION_CHARS),
    startDate: clipOpt(job.startDate, MAX_STORED_DATE_FIELD_CHARS),
    endDate:
      job.endDate === null
        ? null
        : clipOpt(job.endDate ?? undefined, MAX_STORED_DATE_FIELD_CHARS),
    bullets: job.bullets.slice(0, MAX_STORED_BULLETS_PER_ROLE).map((b) => ({
      ...b,
      text: clip(b.text ?? "", MAX_BULLET_CHARS),
    })),
  }));
}

function clampSkillGroups(groups: ResumeContent["skills"]["groups"]) {
  return groups.slice(0, MAX_STORED_SKILL_GROUPS).map((g) => ({
    ...g,
    name: clip(g.name ?? "", MAX_STORED_GROUP_NAME_CHARS),
    items: g.items
      .slice(0, MAX_STORED_SKILL_GROUP_ITEMS)
      .map((item) => clip(item.trim(), MAX_STORED_SKILL_ITEM_CHARS))
      .filter(Boolean),
  }));
}

function clampEducationItems(items: ResumeContent["education"]["items"]) {
  return items.slice(0, MAX_STORED_EDUCATION_ITEMS).map((ed) => ({
    ...ed,
    institution: clip(ed.institution ?? "", MAX_STORED_INSTITUTION_CHARS),
    degree: clipOpt(ed.degree, MAX_STORED_DEGREE_FIELD_CHARS),
    field: clipOpt(ed.field, MAX_STORED_DEGREE_FIELD_CHARS),
    startDate: clipOpt(ed.startDate, MAX_STORED_DATE_FIELD_CHARS),
    endDate: clipOpt(ed.endDate, MAX_STORED_DATE_FIELD_CHARS),
    details: clipOpt(ed.details, MAX_STORED_EDUCATION_DETAILS_CHARS),
  }));
}

function clampMeta(m: ResumeMeta): ResumeMeta {
  return {
    ...m,
    templateId:
      typeof m.templateId === "string"
        ? clip(m.templateId, 120)
        : m.templateId,
  };
}
