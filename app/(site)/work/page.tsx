import type { Metadata } from "next";
import Script from "next/script";
import { PageHeader } from "@/components/sections/page-header";
import { ProjectGrid } from "@/components/sections/project-grid";
import { serializeJsonLd } from "@/lib/json-ld";
import { parseProjectBusinessParam } from "@/lib/project-business";
import {
  buildSharingMetadata,
  resolveSharingImage
} from "@/lib/sharing-metadata";
import { buildPageStructuredData } from "@/lib/site-structured-data";
import { getPublishedProjects, getSiteSettings } from "@/lib/supabase";
import { parseSearchParam } from "@/lib/utils";

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
  searchParams?: Promise<{
    business?: string | string[];
    category?: string | string[];
  }>;
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

  const requestedCategory = parseSearchParam(resolvedSearchParams.category);
  const businessScopedProjects = initialBusiness
    ? projects.filter((project) => project.business === initialBusiness)
    : projects;
  const matchingCategory = requestedCategory
    ? businessScopedProjects.find(
        (project) =>
          project.category.toLowerCase() === requestedCategory.toLowerCase()
      )?.category
    : null;
  const initialCategory =
    requestedCategory && matchingCategory ? matchingCategory : null;

  const copy = initialBusiness
    ? `Selected ${initialBusiness.toLowerCase()} work.`
    : settings.copy.work.copy;
  const structuredData = buildPageStructuredData({
    name: pageTitle,
    description: pageDescription,
    path: "/work",
    type: "CollectionPage",
    projects
  });

  return (
    <>
      <Script
        id="schema-work-collection"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />
      <PageHeader
        eyebrow={settings.copy.work.eyebrow}
        lead={initialBusiness ?? settings.copy.work.headlineLead}
        trail={initialBusiness ? "Projects" : settings.copy.work.headlineTrail}
        copy={copy}
      />
      <ProjectGrid
        key={`${initialBusiness ?? "All"}-${initialCategory ?? "All"}`}
        projects={projects}
        initialBusiness={initialBusiness}
        initialCategory={initialCategory}
      />
    </>
  );
}
