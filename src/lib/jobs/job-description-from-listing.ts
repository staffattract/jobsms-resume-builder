import { MAX_JOB_DESCRIPTION_CHARS, truncate } from "@/lib/ai/limits";
import type { JobListing } from "./employment-alert-types";

/** Canonical text pasted into Tailor modal from API fields (within AI limits). */
export function descriptionFromListing(job: JobListing): string {
  const loc = [job.location, job.state, job.country]
    .map((x) => x.trim())
    .filter(Boolean)
    .join(", ");
  const chunks = [
    job.title.trim(),
    job.company.trim() ? `Company: ${job.company.trim()}` : "",
    loc ? `Location: ${loc}` : "",
    job.category.trim() ? `Category: ${job.category.trim()}` : "",
    job.description.trim(),
  ].filter(Boolean);
  const body = chunks.join("\n\n");
  return truncate(body, MAX_JOB_DESCRIPTION_CHARS);
}
