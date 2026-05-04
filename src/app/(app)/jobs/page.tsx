import type { Metadata } from "next";
import { JobsPageClient } from "@/components/jobs/JobsPageClient";
import { requireUser } from "@/lib/auth/require-user";
import { listResumesWithContentForCurrentUser } from "@/lib/resume/queries";

export const metadata: Metadata = {
  title: "Jobs search — Resume builder",
  description: "Search listings and tailor your resumes to roles.",
};

type PageProps = {
  searchParams?: Promise<{ keyword?: string; location?: string }>;
};

export default async function JobsPage({ searchParams }: PageProps) {
  await requireUser();
  const resumes = await listResumesWithContentForCurrentUser();

  let initialKeyword = "";
  let initialLocation = "";
  if (searchParams) {
    const qp = await searchParams;
    if (qp.keyword?.trim()) {
      initialKeyword = qp.keyword.trim();
    }
    if (qp.location?.trim()) {
      initialLocation = qp.location.trim();
    }
  }

  return (
    <JobsPageClient
      resumes={resumes}
      initialKeyword={initialKeyword}
      initialLocation={initialLocation}
    />
  );
}
