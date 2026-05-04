import { NextResponse } from "next/server";
import type { JobInteraction } from "@/generated/prisma/client";
import { requireVerifiedSessionUser } from "@/lib/auth/api-auth";
import { prisma } from "@/lib/db";
import { jobsSearchQuerySchema } from "@/lib/jobs/api-schemas";
import { searchEmploymentAlertJobs } from "@/lib/jobs/employment-alert-client";
import type { JobListing } from "@/lib/jobs/employment-alert-types";

export type JobsSearchInteractionDto = Pick<
  JobInteraction,
  "id" | "status" | "clickedAt"
>;

export async function GET(request: Request) {
  const user = await requireVerifiedSessionUser();
  if (user instanceof NextResponse) {
    return user;
  }

  const url = new URL(request.url);
  const parsed = jobsSearchQuerySchema.safeParse({
    keyword: url.searchParams.get("keyword"),
    location: url.searchParams.get("location"),
    start: url.searchParams.get("start") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { keyword, location, start, limit } = parsed.data;

  let fetched: Awaited<ReturnType<typeof searchEmploymentAlertJobs>>;
  try {
    fetched = await searchEmploymentAlertJobs({
      keyword,
      location,
      start,
      limit,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Jobs fetch failed";
    const code =
      typeof msg === "string" &&
      msg.startsWith("Missing required environment variable")
        ? "JOBS_API_NOT_CONFIGURED"
        : "JOBS_FETCH_FAILED";
    console.error("[jobs/search]", msg);
    return NextResponse.json(
      { error: code },
      { status: code === "JOBS_API_NOT_CONFIGURED" ? 503 : 502 },
    );
  }

  const ids = fetched.jobs.map((j: JobListing) => j.externalJobId);
  const interactions =
    ids.length === 0
      ? []
      : await prisma.jobInteraction.findMany({
          where: { userId: user.id, externalJobId: { in: ids } },
        });
  const byExternal = Object.fromEntries(
    interactions.map((i) => [i.externalJobId, i]),
  );

  const interactionDto = (
    row: JobInteraction,
  ): JobsSearchInteractionDto => ({
    id: row.id,
    status: row.status,
    clickedAt: row.clickedAt,
  });

  const jobs = fetched.jobs.map((job) => ({
    listing: job,
    interaction:
      job.externalJobId in byExternal && byExternal[job.externalJobId]
        ? interactionDto(byExternal[job.externalJobId]!)
        : null,
  }));

  return NextResponse.json({
    jobs,
    meta: fetched.meta,
    query: { keyword, location, start, limit },
  });
}
