import { requireEnv } from "@/lib/env/server";

/** Full Employment Alert endpoint URL **without query** (e.g. `https://jobapi.example.com/result_zipcode.php`). */
export function getJobApiBaseUrl(): string {
  const raw = requireEnv("JOB_API_BASE_URL").trim();
  if (!raw.endsWith(".php")) {
    console.warn(
      "[jobs] JOB_API_BASE_URL should normally end with `.php`; check your Employment Alert endpoint URL.",
    );
  }
  return raw.replace(/\/$/, "");
}

export type JobApiCredentials = {
  baseUrl: string;
  pid: string;
  affId: string;
  subId: string;
  siteId: string;
};

export function getJobApiCredentials(): JobApiCredentials {
  return {
    baseUrl: getJobApiBaseUrl(),
    pid: requireEnv("JOB_API_PID").trim(),
    affId: requireEnv("JOB_API_AFF_ID").trim(),
    subId: requireEnv("JOB_API_SUB_ID").trim(),
    siteId: requireEnv("JOB_API_SITE_ID").trim(),
  };
}
