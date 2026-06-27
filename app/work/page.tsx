import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/page-header";
import { ProjectGrid } from "@/components/sections/project-grid";
import { parseProjectBusinessParam } from "@/lib/project-business";
import { getPublishedProjects } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected films, stills, and campaign work by Lux Studio.",
  alternates: {
    canonical: "/work"
  }
};

type WorkPageProps = {
  searchParams?: Promise<{ business?: string | string[] }>;
};

export default async function WorkPage({ searchParams }: WorkPageProps) {
  const projects = await getPublishedProjects();
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const requestedBusiness = parseProjectBusinessParam(
    resolvedSearchParams.business
  );
  const initialBusiness =
    requestedBusiness &&
    projects.some((project) => project.business === requestedBusiness)
      ? requestedBusiness
      : null;
  const copy = initialBusiness
    ? `Selected ${initialBusiness.toLowerCase()} work, shaped for launch moments, brand films, and still-led stories.`
    : "A curated view of films, stills, and campaign fragments built around cars, spaces, and launch moments.";

  return (
    <>
      <PageHeader
        eyebrow="Curated portfolio"
        lead={initialBusiness ?? "Selected"}
        trail="Projects"
        copy={copy}
      />
      <ProjectGrid
        key={initialBusiness ?? "All"}
        projects={projects}
        initialBusiness={initialBusiness}
      />
    </>
  );
}
