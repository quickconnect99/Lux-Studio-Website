import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/page-header";
import { ProjectGrid } from "@/components/sections/project-grid";
import { parseProjectBusinessParam } from "@/lib/project-business";
import {
  buildSharingMetadata,
  resolveSharingImage
} from "@/lib/sharing-metadata";
import { getPublishedProjects, getSiteSettings } from "@/lib/supabase";

const pageTitle = "Work";
const pageDescription =
  "Selected films, stills, and campaign work by Lux Studio.";

export async function generateMetadata(): Promise<Metadata> {
  const [projects, settings] = await Promise.all([
    getPublishedProjects(),
    getSiteSettings()
  ]);
  const image = resolveSharingImage({ projects, settings });

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: "/work"
    },
    ...buildSharingMetadata({
      title: `${pageTitle} | ${settings.brand.name}`,
      description: pageDescription,
      image,
      imageAlt: `${settings.brand.name} selected project`,
      siteName: settings.brand.name
    })
  };
}

type WorkPageProps = {
  searchParams?: Promise<{ business?: string | string[] }>;
};

export default async function WorkPage({ searchParams }: WorkPageProps) {
  const [projects, settings] = await Promise.all([
    getPublishedProjects(),
    getSiteSettings()
  ]);
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const requestedBusiness = parseProjectBusinessParam(
    resolvedSearchParams.business
  );
  const matchingBusiness = requestedBusiness
    ? projects.find(
        (project) =>
          project.business.toLowerCase() === requestedBusiness.toLowerCase()
      )?.business
    : null;
  const initialBusiness =
    requestedBusiness && matchingBusiness ? matchingBusiness : null;
  const copy = initialBusiness
    ? `Selected ${initialBusiness.toLowerCase()} work.`
    : settings.copy.work.copy;

  return (
    <>
      <PageHeader
        eyebrow={settings.copy.work.eyebrow}
        lead={initialBusiness ?? settings.copy.work.headlineLead}
        trail={initialBusiness ? "Projects" : settings.copy.work.headlineTrail}
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
