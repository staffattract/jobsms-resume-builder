import { XMLParser } from "fast-xml-parser";

import type { JobsSearchMeta, JobListing } from "./employment-alert-types";
import { getJobApiCredentials } from "./config";
import { isAllowedEmploymentAlertJobUrl } from "./job-listing-url";

/** Reject oversized bodies before parsing to limit memory/work from malicious or broken upstream. */
export const MAX_JOBS_XML_RESPONSE_BYTES = 1 << 20;

const parser = new XMLParser({
  ignoreAttributes: true,
  trimValues: true,
  /** Single `<JOB>` is returned as object; always store as `[…]` for uniform parsing. */
  isArray: (tagName) => tagName === "JOB",
});

type PrimitiveOrObj = Record<string, unknown>;

function coerceText(v: unknown): string | undefined {
  if (v === undefined || v === null) {
    return undefined;
  }
  if (typeof v === "string") {
    const t = v.trim();
    return t.length ? t : undefined;
  }
  if (typeof v === "number" || typeof v === "boolean") {
    return String(v);
  }
  if (typeof v === "object") {
    const o = v as PrimitiveOrObj;
    const nested = o["#text"];
    if (typeof nested === "string" || typeof nested === "number") {
      const t = String(nested).trim();
      return t.length ? t : undefined;
    }
  }
  return undefined;
}

function jobFromXml(j: PrimitiveOrObj | undefined): JobListing | null {
  if (!j || typeof j !== "object") {
    return null;
  }
  const externalJobId = coerceText(j["id"]);
  const title = coerceText(j["title"]) ?? "Untitled role";
  const url = coerceText(j["url"]) ?? "";
  if (!externalJobId || !url || !isAllowedEmploymentAlertJobUrl(url)) {
    return null;
  }

  const description = coerceText(j["description"]) ?? "";

  return {
    externalJobId,
    title,
    company: coerceText(j["company"]) ?? "",
    description,
    url,
    location: coerceText(j["location"]) ?? "",
    state: coerceText(j["state"]) ?? "",
    country: coerceText(j["country"]) ?? "",
    category: coerceText(j["category"]) ?? "",
    categoryId: coerceText(j["categoryId"]) ?? "",
    created_date: coerceText(j["created_date"]),
    logo: coerceText(j["logo"]),
  };
}

/** Metadata fields may live beside `<JOB>` under `<JOBS>`. */
function metaFromRoot(jobsNode: PrimitiveOrObj | undefined): JobsSearchMeta {
  if (!jobsNode || typeof jobsNode !== "object") {
    return {};
  }
  return {
    totaljobs: coerceText(jobsNode["totaljobs"]),
    keyword: coerceText(jobsNode["keyword"]),
    location: coerceText(jobsNode["location"]),
    city: coerceText(jobsNode["city"]),
    state: coerceText(jobsNode["state"]),
  };
}

/** Build request URL including partner params (never log full URLWithSecrets in production). */
export function buildJobsSearchUrl(input: {
  keyword: string;
  location: string;
  start: number;
  limit: number;
}): URL {
  const { baseUrl, pid, affId, subId, siteId } = getJobApiCredentials();
  const url = new URL(baseUrl.includes("://") ? baseUrl : `https://${baseUrl}`);
  url.searchParams.set("pid", pid);
  url.searchParams.set("aff_id", affId);
  url.searchParams.set("sub_id", subId);
  url.searchParams.set("siteid", siteId);
  url.searchParams.set("keyword", input.keyword);
  url.searchParams.set("location", input.location);
  url.searchParams.set("start", String(input.start));
  url.searchParams.set("limit", String(input.limit));
  return url;
}

export async function searchEmploymentAlertJobs(params: {
  keyword: string;
  location: string;
  start: number;
  limit: number;
}): Promise<{ jobs: JobListing[]; meta: JobsSearchMeta }> {
  const url = buildJobsSearchUrl(params);

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
      headers: { Accept: "application/xml, text/xml, */*" },
      next: { revalidate: 0 },
    });
  } catch (e) {
    console.error("[jobs/upstream]", "fetch failed", e);
    throw new Error("JOBS_FETCH_TRANSPORT_FAILED");
  }

  const buf = await res.arrayBuffer();
  if (buf.byteLength > MAX_JOBS_XML_RESPONSE_BYTES) {
    console.error(
      "[jobs/upstream]",
      "response exceeds size cap bytes=",
      buf.byteLength,
      "limit=",
      MAX_JOBS_XML_RESPONSE_BYTES,
    );
    throw new Error("JOBS_RESPONSE_TOO_LARGE");
  }
  const text = new TextDecoder().decode(buf);

  if (!res.ok) {
    console.error(
      "[jobs/upstream]",
      "HTTP",
      res.status,
      truncateForError(text),
    );
    throw new Error(`JOBS_UPSTREAM_HTTP_${res.status}`);
  }

  let parsed: unknown;
  try {
    parsed = parser.parse(text);
  } catch (e) {
    console.error("[jobs/upstream]", "invalid XML", e);
    throw new Error("JOBS_XML_PARSE_FAILED");
  }

  const parsedRoot = parsed as Record<string, unknown> | null | undefined;

  let jobsWrapper: PrimitiveOrObj | undefined;
  if (
    parsedRoot &&
    typeof parsedRoot === "object" &&
    "JOBS" in parsedRoot &&
    parsedRoot.JOBS !== null &&
    parsedRoot.JOBS !== undefined &&
    typeof parsedRoot.JOBS === "object"
  ) {
    jobsWrapper = parsedRoot.JOBS as PrimitiveOrObj;
  } else if (parsedRoot && typeof parsedRoot === "object") {
    jobsWrapper = parsedRoot as PrimitiveOrObj;
  }

  const meta =
    typeof jobsWrapper === "object" && jobsWrapper
      ? metaFromRoot(jobsWrapper)
      : {};

  const rawJobs =
    jobsWrapper && typeof jobsWrapper.JOB !== "undefined"
      ? jobsWrapper.JOB
      : undefined;
  const asArray = Array.isArray(rawJobs)
    ? (rawJobs as PrimitiveOrObj[])
    : rawJobs !== undefined && rawJobs !== null
      ? [rawJobs as PrimitiveOrObj]
      : [];

  const jobs: JobListing[] = [];
  for (const item of asArray) {
    const mapped = jobFromXml(item as PrimitiveOrObj);
    if (mapped) {
      jobs.push(mapped);
    }
  }

  return { jobs, meta };
}

function truncateForError(s: string, max = 200): string {
  const oneLine = s.replace(/\s+/g, " ").trim();
  return oneLine.length <= max ? oneLine : oneLine.slice(0, max) + "…";
}
