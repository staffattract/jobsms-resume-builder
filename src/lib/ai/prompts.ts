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
