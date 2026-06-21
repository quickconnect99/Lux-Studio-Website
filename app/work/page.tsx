import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/page-header";
import { ProjectGrid } from "@/components/sections/project-grid";
import { parseProjectBusinessParam } from "@/lib/project-business";
import { getPublishedProjects } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Curated campaign films, stills, and premium motion projects.",
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
    ? `Showing ${initialBusiness.toLowerCase()} work first, with category filters available inside the grid.`
    : "A visual-first grid with business and category filters, plus enough white space to keep premium media readable.";

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
