/**
 * Server-only prompt templates. Do not import from client components.
 */

export function improveBulletUserPrompt(bulletText: string): string {
  return `Rewrite the following resume bullet to be clearer, more specific, and more achievement-oriented. Use strong action verbs and quantifiable impact where reasonable. Keep one bullet (not a list). Do not add fabricated metrics.

Bullet:
${bulletText}

Return only the improved bullet text, with no quotes or preamble.`;
}

export function generateSummaryUserPrompt(resumeJson: string): string {
  return `You are writing a professional resume summary (2–4 sentences) based on this resume JSON. Infer strengths from experience, skills, and education. Do not invent employers, degrees, or metrics not implied by the data.

Resume JSON:
${resumeJson}

Return only the summary paragraph, with no quotes or preamble.`;
}

export function tailorToJobUserPrompt(
  jobDescription: string,
  resumeJson: string,
): string {
  return `You align a resume to a job posting (V1 scope only).

Job description:
${jobDescription}

Current resume (JSON):
${resumeJson}

Respond with valid JSON only (no markdown fences). Include ONLY these two keys — no other keys (the server will ignore any extra keys):
{"summary":"...","alignmentNotes":"..."}

- "summary": a tailored professional summary (2–4 sentences) for this job.
- "alignmentNotes": 2–5 short bullet-style lines (plain text with newlines) for keyword/focus alignment; use "" if not needed.

Do NOT propose or embed edits to work experience bullets, skills, education, or contact in this JSON — summary and alignmentNotes only.

Do not invent employers, titles, or credentials not supported by the resume JSON.`;
}

export const ASSISTANT_STYLE =
  "You are a concise resume-writing assistant. Follow instructions exactly.";

/** Turn plain resume text into structured JSON matching the app resume schema. */
export function uploadResumeImproveUserPrompt(rawResumeText: string): string {
  return `You receive plain text extracted from a user's resume (PDF or Word). Produce an improved version as structured data.

Source text (may be noisy or mis-ordered):
${rawResumeText}

Return ONLY valid JSON (no markdown code fences). The JSON must match this shape and key names exactly:
{
  "contact": { "fullName"?: string, "email"?: string, "phone"?: string, "location"?: string, "links": [{ "id": string, "label"?: string, "url"?: string }] },
  "target": { "jobTitle"?: string, "company"?: string, "notes"?: string },
  "summary": { "text": string },
  "experience": { "items": [{ "id": string, "employer": string, "title": string, "location"?: string, "startDate"?: string, "endDate"?: string | null, "bullets": [{ "id": string, "text": string }] }] },
  "skills": { "groups": [{ "id": string, "name": string, "items": string[] }] },
  "education": { "items": [{ "id": string, "institution": string, "degree"?: string, "field"?: string, "startDate"?: string, "endDate"?: string, "details"?: string }] },
  "meta": { "lastStepIndex": number, "templateId": string }
}

Rules:
- Improve bullet wording (clear, achievement-oriented); tighten phrasing; fix obvious typos.
- Keep employers, titles, institutions, degrees, and dates truthful to the source — do not invent jobs, companies, schools, or metrics.
- Do not invent certifications, licenses, professional registrations, tools, employers, titles, institutions, dates, degrees, or fields absent from the source text.
- If a fact (including numbers, KPIs, or dates) did not clearly appear in the source, omit it from bullets and summaries rather than guessing.
- If the source omits data, use empty strings or empty arrays; "meta.lastStepIndex" should be 0 and "meta.templateId" should be "classic".
- "summary.text": 2–4 professional sentences derived only from the provided facts.
- Every "id" in arrays must be a unique non-empty string (any stable string is fine).`;
}

/** New resume from target job title + optional pasted experience (public builder). */
export function scratchBuildUserPrompt(
  jobTitle: string,
  experienceOrResume: string,
): string {
  const context = experienceOrResume.trim();
  return `The user is building a resume for this target job title: ${JSON.stringify(
    jobTitle,
  )}

${
  context
    ? `They pasted this text (may be notes, partial resume, or experience):\n${context}\n`
    : "They did not paste any experience — create outline content only, no invented employers or dates.\n"
}

Return ONLY valid JSON (no markdown code fences). The JSON must match this shape and key names exactly:
{
  "contact": { "fullName"?: string, "email"?: string, "phone"?: string, "location"?: string, "links": [{ "id": string, "label"?: string, "url"?: string }] },
  "target": { "jobTitle"?: string, "company"?: string, "notes"?: string },
  "summary": { "text": string },
  "experience": { "items": [{ "id": string, "employer": string, "title": string, "location"?: string, "startDate"?: string, "endDate"?: string | null, "bullets": [{ "id": string, "text": string }] }] },
  "skills": { "groups": [{ "id": string, "name": string, "items": string[] }] },
  "education": { "items": [{ "id": string, "institution": string, "degree"?: string, "field"?: string, "startDate"?: string, "endDate"?: string, "details"?: string }] },
  "meta": { "lastStepIndex": number, "templateId": string }
}

Rules:
- Set "target.jobTitle" to the user's target job title (the same as their stated job title).
- "summary.text": 2–4 strong, professional sentences. Use only facts from pasted text; if there is no paste, write a tight summary of intent and fit for the target role (no made-up employers or schools).
${
  context
    ? "- Derive 2–3 experience items from the pasted text. Use strong action verbs, clear results. Do NOT invent company names, titles, or dates: only use what the text supports. Leave unknown dates blank.\n- Do not add percentages, KPIs, revenue figures, certifications, honors, patents, clearance levels, or metrics that do not plainly appear in the paste.\n- Skills: group relevant skills from the paste and job title. If a skill is not supported by the paste or title alone, omit it."
    : '- Include 2–3 "experience" items: use employer "—" and title that indicates where to add the user\'s real role (e.g. "Add your title"), with 2–4 bullets per job describing competencies typical for the target title — as placeholders the user will replace, not as factual employment history. Leave dates empty. Do not name real companies.\n- Skills: 1–2 groups with items inferred only from the job title (e.g. tools/domains) — no false employers.\n'
}
- "meta.lastStepIndex": 0, "meta.templateId": "professional" (or "classic" if you prefer; must be a string).
- "education": only if supported by the paste; else empty array.
- Return JSON only, no other text.`;
}

/** Fills or tightens summary, skills, and experience bullets from partial user data. */
export function fillPartialResumeUserPrompt(resumeJson: string): string {
  return `You receive a partial resume as JSON. Return improved JSON in the exact same top-level structure and key names (contact, target, summary, experience, skills, education, meta).

User JSON (source of truth for all factual fields):
${resumeJson}

Rules (strict):
- For contact, target (job/company/notes), every experience item "employer", "title", "location", "startDate", "endDate", every education "institution", "degree", "field", and all dates: if the user has a value, you MUST return that exact value unchanged. Do not invent, rename, or add companies, job titles, schools, degrees, or dates.
- "summary.text": if the user left it empty, write 2–4 sentences using only facts in the user JSON. If the user has text, you may lightly tighten for clarity but do not add new facts.
- "skills.groups": if the user has no real skills, create 1–2 groups with items that are clearly implied by the stated role and responsibilities. If the user has skills, keep them and you may rephrase; add only terms clearly implied.
- "experience.items[].bullets": improve wording and impact; use strong action verbs. Do not add employers or roles the user did not list. You may add bullets only where the user already described work in rough text, or rephrase existing bullet text.
- Do not introduce new percentages, dollar amounts, KPIs, certifications, licenses, honors, patents, clearance levels, tool names, company names, job titles, school names, degree names, fields of study, or date ranges unless they already appear as non-empty strings in the user JSON (verbatim values you must not alter when present).
- Preserve every "id" on items, groups, and bullets. Same array lengths for experience and education as the user (unless the user has zero — then return zero for that section).
- "meta": copy from the user; keep "lastStepIndex" 0, keep "templateId" as given.

Return ONLY valid JSON, no markdown code fences, no other text.`;
}
