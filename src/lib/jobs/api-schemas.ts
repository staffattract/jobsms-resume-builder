import { JobInteractionStatus } from "@/generated/prisma/client";
import {
  EMPLOYMENT_ALERT_JOB_URL_MAX_LEN,
  isAllowedEmploymentAlertJobUrl,
} from "@/lib/jobs/job-listing-url";
import { z } from "zod";

export const JobInteractionStatusSchema = z.nativeEnum(JobInteractionStatus);

/** Query params / body fields shared across click & status upserts */
export const jobListingSnapshotSchema = z.object({
  externalJobId: z.string().trim().min(1).max(160),
  title: z.string().trim().min(1).max(300),
  company: z.preprocess((v) => (v === "" || v === null ? undefined : v), z.string().max(280).optional()),
  location: z.preprocess((v) => (v === "" || v === null ? undefined : v), z.string().max(280).optional()),
  jobUrl: z
    .string()
    .trim()
    .max(EMPLOYMENT_ALERT_JOB_URL_MAX_LEN)
    .refine(isAllowedEmploymentAlertJobUrl, { message: "Invalid job URL" }),
  keyword: z.string().trim().min(1).max(160),
  searchedLocation: z.string().trim().min(1).max(64),
});

export const jobsSearchQuerySchema = z.object({
  keyword: z.string().trim().min(1).max(160),
  location: z.string().trim().min(1).max(64),
  start: z.coerce.number().int().min(0).max(990).catch(0),
  limit: z.coerce.number().int().min(1).max(25).catch(25),
});

export const jobsStatusBodySchema = jobListingSnapshotSchema.extend({
  status: JobInteractionStatusSchema,
});

export type JobListingSnapshot = z.infer<typeof jobListingSnapshotSchema>;
