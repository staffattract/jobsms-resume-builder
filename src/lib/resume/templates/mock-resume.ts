import { coerceResumeTemplateId } from "@/lib/resume/templates/registry";
import type { ResumeContent } from "@/lib/resume/types";

/** Sample résumé used only for template gallery mini-previews (not persisted). */
export const MOCK_RESUME_TITLE = "Daniel Johnson";

export const MOCK_RESUME_CONTENT: ResumeContent = {
  contact: {
    fullName: "Daniel Johnson",
    email: "daniel.johnson@email.com",
    phone: "(415) 555-0198",
    location: "San Francisco, CA",
    links: [
      { id: "mock-link-1", label: "LinkedIn", url: "https://linkedin.com/in/example" },
    ],
  },
  target: {
    jobTitle: "Senior Product Manager",
    company: "Series B SaaS",
    notes: "Targeting B2B platforms with strong growth and design-minded teams.",
  },
  summary: {
    text: "Product leader with 8+ years shipping customer-facing SaaS. Known for turning ambiguous problems into measurable outcomes, aligning design and engineering, and scaling roadmaps from zero to one.",
  },
  experience: {
    items: [
      {
        id: "mock-exp-1",
        employer: "Northline Analytics",
        title: "Lead Product Manager",
        location: "Remote",
        startDate: "2021-03",
        endDate: null,
        bullets: [
          {
            id: "mock-b-1",
            text: "Owned roadmap for core reporting suite used by 4k+ paying teams; improved activation by 18% YoY.",
          },
          {
            id: "mock-b-2",
            text: "Partnered with design and data science to launch cohort retention dashboards adopted by 62% of accounts in Q1.",
          },
          {
            id: "mock-b-3",
            text: "Hired and mentored two PMs; introduced lightweight PRD template adopted org-wide.",
          },
        ],
      },
      {
        id: "mock-exp-2",
        employer: "Harbor Payments",
        title: "Senior Product Manager",
        location: "San Francisco, CA",
        startDate: "2017-06",
        endDate: "2021-02",
        bullets: [
          {
            id: "mock-b-4",
            text: "Led checkout modernization; reduced failed payments by 23% and lifted conversion 9%.",
          },
          {
            id: "mock-b-5",
            text: "Defined success metrics with finance stakeholders; shipped pricing experiments with guardrails.",
          },
        ],
      },
      {
        id: "mock-exp-3",
        employer: "Brightline Mobile",
        title: "Product Manager",
        location: "Oakland, CA",
        startDate: "2015-01",
        endDate: "2017-05",
        bullets: [
          {
            id: "mock-b-6",
            text: "Shipped onboarding redesign that cut time-to-value from 14 minutes to under 6.",
          },
        ],
      },
    ],
  },
  skills: {
    groups: [
      {
        id: "mock-sk-1",
        name: "Product & delivery",
        items: [
          "Roadmapping",
          "Discovery",
          "Stakeholder management",
          "A/B testing",
          "SQL (intermediate)",
        ],
      },
      {
        id: "mock-sk-2",
        name: "Tools",
        items: ["Figma", "Amplitude", "Jira", "Looker", "Notion"],
      },
    ],
  },
  education: {
    items: [
      {
        id: "mock-edu-1",
        institution: "University of California, Berkeley",
        degree: "B.A.",
        field: "Economics",
        startDate: "2009",
        endDate: "2013",
        details: "Dean’s List; Economics Honors Society.",
      },
    ],
  },
  meta: {
    lastStepIndex: 0,
    templateId: "professional",
    templateSelectionComplete: true,
  },
};

export function mockResumeContentForTemplate(templateId: string): ResumeContent {
  return {
    ...MOCK_RESUME_CONTENT,
    meta: {
      ...MOCK_RESUME_CONTENT.meta,
      templateId: coerceResumeTemplateId(templateId),
    },
  };
}
