/** Keep prompts within safe sizes for latency and cost. */

export const MAX_BULLET_CHARS = 2_000;
export const MAX_JOB_DESCRIPTION_CHARS = 8_000;
export const MAX_RESUME_JSON_CHARS = 48_000;
/** Raw text from PDF/DOCX before JSON conversion (upload flow). */
export const MAX_UPLOAD_RESUME_TEXT = 28_000;

export function truncate(text: string, max: number): string {
  if (text.length <= max) {
    return text;
  }
  return text.slice(0, max) + "\n\n[truncated]";
}
