import { NextResponse } from "next/server";
import { JobInteractionStatus } from "@/generated/prisma/client";
import { requireVerifiedSessionUser } from "@/lib/auth/api-auth";
import { jobListingSnapshotSchema } from "@/lib/jobs/api-schemas";
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

  const parsed = jobListingSnapshotSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const snap = parsed.data;
  const now = new Date();

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
      status: JobInteractionStatus.NONE,
      clickedAt: now,
    },
    update: {
      title: snap.title,
      company: snap.company ?? null,
      location: snap.location ?? null,
      jobUrl: snap.jobUrl,
      keyword: snap.keyword,
      searchedLocation: snap.searchedLocation,
      clickedAt: now,
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
