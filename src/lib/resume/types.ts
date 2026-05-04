import {
  coerceResumeTemplateId,
  DEFAULT_RESUME_TEMPLATE_ID,
} from "@/lib/resume/templates/registry";

export interface ContactLink {
  id: string;
  label?: string;
  url?: string;
}

export interface ResumeContact {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  links: ContactLink[];
}

export interface ResumeTarget {
  jobTitle?: string;
  company?: string;
  notes?: string;
}

export interface ResumeSummary {
  text: string;
}

export interface ExperienceBullet {
  id: string;
  text: string;
}

export interface ExperienceItem {
  id: string;
  employer: string;
  title: string;
  location?: string;
  startDate?: string;
  endDate?: string | null;
  bullets: ExperienceBullet[];
}

export interface SkillsGroup {
  id: string;
  name: string;
  items: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree?: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  details?: string;
}

export interface ResumeMeta {
  lastStepIndex: number;
  /** Presentation template id (see `templates/registry`). */
  templateId: string;
  /** When false, user must complete the template picker before the editor. */
  templateSelectionComplete: boolean;
}

export interface ResumeContent {
  contact: ResumeContact;
  target: ResumeTarget;
  summary: ResumeSummary;
  experience: { items: ExperienceItem[] };
  skills: { groups: SkillsGroup[] };
  education: { items: EducationItem[] };
  meta: ResumeMeta;
}

export function defaultResumeContent(): ResumeContent {
  return {
    contact: { links: [] },
    target: {},
    summary: { text: "" },
    experience: { items: [] },
    skills: { groups: [] },
    education: { items: [] },
    meta: {
      lastStepIndex: 0,
      templateId: DEFAULT_RESUME_TEMPLATE_ID,
      templateSelectionComplete: true,
    },
  };
}

/** Bounds for salvaging AI JSON (finer limits applied in `clampResumeContentDeep`). */
const MAX_EXP_ITEMS_SALVAGE = 32;
const MAX_BULLETS_SALVAGE = 28;
const MAX_EDU_ITEMS_SALVAGE = 20;
const MAX_SKILL_GROUPS_SALVAGE = 32;
const MAX_SKILL_ITEMS_PER_GROUP_SALVAGE = 60;
const MAX_CONTACT_LINKS_SALVAGE = 24;
/** Pre-clamp field width for noisy model output. */
const MAX_LOOSE_TEXT = 800;

function coerceLooseText(v: unknown, max: number): string {
  if (typeof v === "string") {
    return v.trim().slice(0, max);
  }
  if (typeof v === "number" && Number.isFinite(v)) {
    return String(v).trim().slice(0, max);
  }
  return "";
}

function coerceOptionalString(v: unknown, max: number): string | undefined {
  const s = coerceLooseText(v, max);
  return s || undefined;
}

function salvageExperienceBullets(raw: unknown): ExperienceBullet[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const out: ExperienceBullet[] = [];
  for (const b of raw) {
    if (!b || typeof b !== "object") {
      continue;
    }
    const o = b as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id.trim() : "";
    const text = coerceLooseText(o.text, MAX_LOOSE_TEXT);
    out.push({ id, text });
    if (out.length >= MAX_BULLETS_SALVAGE) {
      break;
    }
  }
  return out;
}

function salvageExperienceRows(raw: unknown): ExperienceItem[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const out: ExperienceItem[] = [];
  for (const x of raw) {
    if (!x || typeof x !== "object") {
      continue;
    }
    const it = x as Record<string, unknown>;
    const id = typeof it.id === "string" ? it.id.trim() : "";
    const employer = coerceLooseText(it.employer, MAX_LOOSE_TEXT) || "—";
    const title = coerceLooseText(it.title, MAX_LOOSE_TEXT);

    const bullets = salvageExperienceBullets(it.bullets);
    const row: ExperienceItem = {
      id,
      employer,
      title,
      bullets,
    };

    const location = coerceOptionalString(it.location, MAX_LOOSE_TEXT);
    if (location) {
      row.location = location;
    }
    const start = coerceOptionalString(it.startDate, 120);
    if (start) {
      row.startDate = start;
    }
    if (it.endDate === null) {
      row.endDate = null;
    } else {
      const endStr = coerceOptionalString(it.endDate, 120);
      if (endStr !== undefined) {
        row.endDate = endStr;
      }
    }

    out.push(row);
    if (out.length >= MAX_EXP_ITEMS_SALVAGE) {
      break;
    }
  }
  return out;
}

function salvageEducationRows(raw: unknown): EducationItem[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const out: EducationItem[] = [];
  for (const x of raw) {
    if (!x || typeof x !== "object") {
      continue;
    }
    const it = x as Record<string, unknown>;
    const id = typeof it.id === "string" ? it.id.trim() : "";
    const institution = coerceLooseText(it.institution, MAX_LOOSE_TEXT);
    const row: EducationItem = {
      id,
      institution,
    };

    const degree = coerceOptionalString(it.degree, 400);
    if (degree !== undefined) {
      row.degree = degree;
    }
    const field = coerceOptionalString(it.field, 400);
    if (field !== undefined) {
      row.field = field;
    }
    const s = coerceOptionalString(it.startDate, 120);
    if (s !== undefined) {
      row.startDate = s;
    }
    const e = coerceOptionalString(it.endDate, 120);
    if (e !== undefined) {
      row.endDate = e;
    }
    const details = coerceOptionalString(it.details, 8_000);
    if (details !== undefined) {
      row.details = details;
    }

    out.push(row);
    if (out.length >= MAX_EDU_ITEMS_SALVAGE) {
      break;
    }
  }
  return out;
}

function salvageSkillGroups(rows: unknown): SkillsGroup[] {
  if (!Array.isArray(rows)) {
    return [];
  }
  const out: SkillsGroup[] = [];
  for (const x of rows) {
    if (!x || typeof x !== "object") {
      continue;
    }
    const g = x as Record<string, unknown>;
    const id = typeof g.id === "string" ? g.id.trim() : "";
    let name = coerceLooseText(g.name, MAX_LOOSE_TEXT);

    const items: string[] = [];
    if (Array.isArray(g.items)) {
      for (const ri of g.items) {
        const s = coerceLooseText(ri, 400);
        if (s) {
          items.push(s);
        }
        if (items.length >= MAX_SKILL_ITEMS_PER_GROUP_SALVAGE) {
          break;
        }
      }
    }

    if (!name && items.length === 0) {
      continue;
    }
    if (!name) {
      name = "Skills";
    }

    out.push({ id, name, items });
    if (out.length >= MAX_SKILL_GROUPS_SALVAGE) {
      break;
    }
  }
  return out;
}

/** Coerces persisted or AI-shaped JSON into a ResumeContent scaffold. */
export function normalizeResumeContent(raw: unknown): ResumeContent {
  const base = defaultResumeContent();
  if (!raw || typeof raw !== "object") {
    return base;
  }
  const r = raw as Record<string, unknown>;

  const contact = (r.contact && typeof r.contact === "object"
    ? (r.contact as Record<string, unknown>)
    : {}) as Record<string, unknown>;
  const target = (r.target && typeof r.target === "object"
    ? (r.target as Record<string, unknown>)
    : {}) as Record<string, unknown>;
  const summary = (r.summary && typeof r.summary === "object"
    ? (r.summary as Record<string, unknown>)
    : {}) as Record<string, unknown>;
  const experience = (r.experience && typeof r.experience === "object"
    ? (r.experience as Record<string, unknown>)
    : {}) as Record<string, unknown>;
  const skills = (r.skills && typeof r.skills === "object"
    ? (r.skills as Record<string, unknown>)
    : {}) as Record<string, unknown>;
  const education = (r.education && typeof r.education === "object"
    ? (r.education as Record<string, unknown>)
    : {}) as Record<string, unknown>;
  const meta = (r.meta && typeof r.meta === "object"
    ? (r.meta as Record<string, unknown>)
    : {}) as Record<string, unknown>;

  const summaryTextUnknown = summary.text;

  return {
    contact: {
      ...base.contact,
      fullName: coerceOptionalString(contact.fullName, MAX_LOOSE_TEXT),
      email: coerceOptionalString(contact.email, MAX_LOOSE_TEXT),
      phone: coerceOptionalString(contact.phone, MAX_LOOSE_TEXT),
      location: coerceOptionalString(contact.location, MAX_LOOSE_TEXT),
      links: Array.isArray(contact.links)
        ? (contact.links as unknown[])
            .flatMap((x): ContactLink[] => {
              if (!x || typeof x !== "object") {
                return [];
              }
              const l = x as Record<string, unknown>;
              const id = typeof l.id === "string" ? l.id.trim() : "";
              return [
                {
                  id,
                  label: coerceOptionalString(l.label, 400),
                  url: coerceOptionalString(l.url, 2_048),
                },
              ];
            })
            .slice(0, MAX_CONTACT_LINKS_SALVAGE)
        : base.contact.links,
    },
    target: {
      jobTitle: coerceOptionalString(target.jobTitle, 400),
      company: coerceOptionalString(target.company, 400),
      notes: coerceOptionalString(target.notes, 800),
    },
    summary: {
      text:
        typeof summaryTextUnknown === "string"
          ? summaryTextUnknown
          : typeof summaryTextUnknown === "number" &&
              Number.isFinite(summaryTextUnknown)
            ? String(summaryTextUnknown)
            : base.summary.text,
    },
    experience: {
      items: salvageExperienceRows(experience.items),
    },
    skills: {
      groups: salvageSkillGroups(skills.groups),
    },
    education: {
      items: salvageEducationRows(education.items),
    },
    meta: {
      lastStepIndex:
        typeof meta.lastStepIndex === "number" &&
        Number.isFinite(meta.lastStepIndex) &&
        meta.lastStepIndex >= 0 &&
        meta.lastStepIndex <= 6
          ? meta.lastStepIndex
          : base.meta.lastStepIndex,
      templateId: coerceResumeTemplateId(
        typeof meta.templateId === "string" ? meta.templateId : undefined,
      ),
      templateSelectionComplete:
        typeof meta.templateSelectionComplete === "boolean"
          ? meta.templateSelectionComplete
          : true,
    },
  };
}
