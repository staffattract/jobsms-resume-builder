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
      templateSelectionComplete: false,
    },
  };
}

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

  return {
    contact: {
      ...base.contact,
      fullName: typeof contact.fullName === "string" ? contact.fullName : undefined,
      email: typeof contact.email === "string" ? contact.email : undefined,
      phone: typeof contact.phone === "string" ? contact.phone : undefined,
      location: typeof contact.location === "string" ? contact.location : undefined,
      links: Array.isArray(contact.links)
        ? (contact.links as unknown[])
            .filter((x): x is ContactLink =>
              !!x &&
              typeof x === "object" &&
              typeof (x as ContactLink).id === "string",
            )
            .map((l) => ({
              id: l.id,
              label: typeof l.label === "string" ? l.label : undefined,
              url: typeof l.url === "string" ? l.url : undefined,
            }))
        : base.contact.links,
    },
    target: {
      jobTitle: typeof target.jobTitle === "string" ? target.jobTitle : undefined,
      company: typeof target.company === "string" ? target.company : undefined,
      notes: typeof target.notes === "string" ? target.notes : undefined,
    },
    summary: {
      text:
        typeof summary.text === "string" ? summary.text : base.summary.text,
    },
    experience: {
      items: Array.isArray(experience.items)
        ? (experience.items as unknown[])
            .map((x): ExperienceItem | null => {
              if (!x || typeof x !== "object") {
                return null;
              }
              const it = x as Record<string, unknown>;
              if (
                typeof it.id !== "string" ||
                typeof it.employer !== "string" ||
                typeof it.title !== "string"
              ) {
                return null;
              }
              const bulletsRaw = Array.isArray(it.bullets) ? it.bullets : [];
              const bullets = bulletsRaw
                .filter(
                  (b): b is ExperienceBullet =>
                    !!b &&
                    typeof b === "object" &&
                    typeof (b as ExperienceBullet).id === "string" &&
                    typeof (b as ExperienceBullet).text === "string",
                )
                .map((b) => ({
                  id: b.id,
                  text: b.text,
                }));
              const row: ExperienceItem = {
                id: it.id,
                employer: it.employer,
                title: it.title,
                bullets,
              };
              if (typeof it.location === "string") {
                row.location = it.location;
              }
              if (typeof it.startDate === "string") {
                row.startDate = it.startDate;
              }
              if (it.endDate === null) {
                row.endDate = null;
              } else if (typeof it.endDate === "string") {
                row.endDate = it.endDate;
              }
              return row;
            })
            .filter((x): x is ExperienceItem => x !== null)
        : base.experience.items,
    },
    skills: {
      groups: Array.isArray(skills.groups)
        ? (skills.groups as unknown[])
            .map((x) => {
              if (
                !x ||
                typeof x !== "object" ||
                typeof (x as SkillsGroup).id !== "string" ||
                typeof (x as SkillsGroup).name !== "string" ||
                !Array.isArray((x as SkillsGroup).items)
              ) {
                return null;
              }
              const items = (x as SkillsGroup).items.filter(
                (i): i is string => typeof i === "string",
              );
              return {
                id: (x as SkillsGroup).id,
                name: (x as SkillsGroup).name,
                items,
              } satisfies SkillsGroup;
            })
            .filter((x): x is SkillsGroup => x !== null)
        : base.skills.groups,
    },
    education: {
      items: Array.isArray(education.items)
        ? (education.items as unknown[]).filter(
            (x): x is EducationItem =>
              !!x &&
              typeof x === "object" &&
              typeof (x as EducationItem).id === "string" &&
              typeof (x as EducationItem).institution === "string",
          )
        : base.education.items,
    },
    meta: {
      lastStepIndex:
        typeof meta.lastStepIndex === "number" &&
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
