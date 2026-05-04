import { NextResponse } from "next/server";
import { JobInteractionStatus } from "@/generated/prisma/client";
import { requireVerifiedSessionUser } from "@/lib/auth/api-auth";
import { jobsStatusBodySchema } from "@/lib/jobs/api-schemas";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const user = await requireVerifiedSessionUser();
  if (user instanceof NextResponse) {
    return user;
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = jobsStatusBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { status, ...snap } = parsed.data;

  /** Set `appliedAt` the first time user marks Applied; never cleared. */
  const existing = await prisma.jobInteraction.findFirst({
    where: { userId: user.id, externalJobId: snap.externalJobId },
    select: { appliedAt: true },
  });
  const setAppliedOnce =
    status === JobInteractionStatus.APPLIED && !existing?.appliedAt
      ? { appliedAt: new Date() }
      : {};

  const interaction = await prisma.jobInteraction.upsert({
    where: {
      userId_externalJobId: {
        userId: user.id,
        externalJobId: snap.externalJobId,
      },
    },
    create: {
      userId: user.id,
      externalJobId: snap.externalJobId,
      title: snap.title,
      company: snap.company ?? null,
      location: snap.location ?? null,
      jobUrl: snap.jobUrl,
      keyword: snap.keyword,
      searchedLocation: snap.searchedLocation,
      source: "employment_alert",
      status,
      ...(status === JobInteractionStatus.APPLIED
        ? { appliedAt: new Date() }
        : {}),
    },
    update: {
      title: snap.title,
      company: snap.company ?? null,
      location: snap.location ?? null,
      jobUrl: snap.jobUrl,
      keyword: snap.keyword,
      searchedLocation: snap.searchedLocation,
      status,
      ...setAppliedOnce,
    },
    select: { id: true, status: true, clickedAt: true, appliedAt: true },
  });

  return NextResponse.json({
    interaction: {
      ...interaction,
      clickedAt: interaction.clickedAt?.toISOString() ?? null,
      appliedAt: interaction.appliedAt?.toISOString() ?? null,
    },
  });
}
