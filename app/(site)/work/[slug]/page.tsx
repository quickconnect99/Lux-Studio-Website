import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import { MetadataGrid } from "@/components/ui/metadata-grid";
import { ProjectMedia } from "@/components/sections/project-media";
import { ProjectImageCarousel } from "@/components/sections/project-image-carousel";
import { LinkButton } from "@/components/ui/link-button";
import { Reveal } from "@/components/ui/reveal";
import { normalizeProjectGallery } from "@/lib/project-images";
import { serializeJsonLd } from "@/lib/json-ld";
import {
  getProjectPrimaryMetaLabel,
  parseProjectBusinessParam,
  projectBusinessToParam
} from "@/lib/project-business";
import {
  buildSharingMetadata,
  resolveSharingImage
} from "@/lib/sharing-metadata";
import {
  buildProjectBreadcrumbSchema,
  buildProjectVideoSchema
} from "@/lib/site-structured-data";
import {
  getProjectBySlug,
  getPublishedProjects,
  getSiteSettings
} from "@/lib/supabase";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ business?: string | string[] }>;
};

export async function generateMetadata({
  params
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [project, settings] = await Promise.all([
    getProjectBySlug(slug),
    getSiteSettings()
  ]);

  if (!project) {
    return {
      title: "Page Not Found",
      description: "The requested Lux Studio project could not be found."
    };
  }

  const title = `${project.title} | ${settings.brand.name}`;
  const sharingImage = resolveSharingImage({
    preferredImages: [project.coverImage, ...project.galleryImages]
  });

  return {
    title: project.title,
    description: project.shortDescription,
    alternates: {
      canonical: `/work/${project.slug}`
    },
    ...buildSharingMetadata({
      title,
      description: project.shortDescription,
      type: "article",
      siteName: settings.brand.name,
      image: sharingImage,
      imageAlt: `${project.title} first project still`
    })
  };
}

export default async function ProjectPage({
  params,
  searchParams
}: ProjectPageProps) {
  const { slug } = await params;
  const projectResult = await getProjectBySlug(slug);

  if (!projectResult) {
    notFound();
  }

  const project = projectResult;

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const activeBusiness = parseProjectBusinessParam(
    resolvedSearchParams.business
  );
  const backHref = activeBusiness
    ? `/work?business=${projectBusinessToParam(activeBusiness)}`
    : "/work";

  const publishedProjects = await getPublishedProjects();
  const businessScopedProjects = activeBusiness
    ? publishedProjects.filter(
        (entry) => entry.business.toLowerCase() === activeBusiness.toLowerCase()
      )
    : publishedProjects;
  const navigableProjects =
    businessScopedProjects.length > 0
      ? businessScopedProjects
      : publishedProjects;
  const currentIndex = navigableProjects.findIndex(
    (entry) => entry.slug === project.slug
  );
  const nextProject =
    navigableProjects.length > 1
      ? navigableProjects[
          (Math.max(currentIndex, 0) + 1) % navigableProjects.length
        ]
      : null;
  const normalizedGallery = normalizeProjectGallery({
    coverImage: project.coverImage,
    galleryImages: project.galleryImages,
    galleryCaptions: project.galleryCaptions ?? []
  });
  const carouselImages = [project.coverImage, ...normalizedGallery.images];
  const carouselCaptions = ["", ...normalizedGallery.captions];
  const [titleLead, ...titleTrailParts] = project.title.trim().split(/\s+/);
  const titleTrail = titleTrailParts.join(" ");

  const primarySubject = project.carModel.trim() || project.category;
  const behindTheScenes = project.behindTheScenes?.trim();
  const breadcrumbSchema = buildProjectBreadcrumbSchema(project);
  const videoSchema = buildProjectVideoSchema(project);

  return (
    <div>
      <Script
        id={`schema-breadcrumb-${project.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }}
      />
      {videoSchema && (
        <Script
          id={`schema-video-${project.slug}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(videoSchema) }}
        />
      )}
      <section className="section-shell pb-8 pt-7 sm:pb-10 sm:pt-20">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal className="space-y-6">
            <p className="eyebrow">
              {project.business} / {project.category}
            </p>
            <h1 className="project-display-title break-words font-[family-name:var(--font-display)] uppercase leading-[0.9] tracking-[-0.05em] text-foreground">
              {titleLead}
              {titleTrail ? (
                <span className="block pl-5 text-accent-text sm:pl-14">
                  {titleTrail}
                </span>
              ) : null}
            </h1>
            <MetadataGrid
              items={[
                {
                  label: getProjectPrimaryMetaLabel(project.business),
                  value: primarySubject
                },
                {
                  label: "Category",
                  value: project.category
                },
                { label: "Location", value: project.location },
                { label: "Year", value: String(project.year) }
              ]}
              className="!grid-cols-2 xl:!grid-cols-4"
              valueClassName="mt-2 text-sm uppercase tracking-meta text-foreground"
            />
            <div
              data-project-description
              className="max-w-3xl space-y-4 border-t border-line pt-5"
            >
              <p className="eyebrow">Project Description</p>
              <p className="description-copy text-muted">
                {project.fullDescription}
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1} direction="right">
            <ProjectMedia project={project} />
          </Reveal>
        </div>
      </section>

      {behindTheScenes ? (
        <section className="section-shell section-space-tight pt-0">
          <Reveal>
            <div className="panel-2xl grid gap-6 p-5 sm:p-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-12 lg:p-10">
              <div className="space-y-3">
                <p className="eyebrow">Production Notes</p>
                <h2 className="font-[family-name:var(--font-display)] text-4xl uppercase leading-[0.92] sm:text-5xl">
                  Behind
                  <span className="block pl-6 text-accent-text sm:pl-10">
                    The Scenes
                  </span>
                </h2>
              </div>
              <p className="description-copy max-w-3xl whitespace-pre-wrap text-muted">
                {behindTheScenes}
              </p>
            </div>
          </Reveal>
        </section>
      ) : null}

      <section className="section-shell section-space-tight pt-0">
        <ProjectImageCarousel
          images={carouselImages}
          captions={carouselCaptions}
          title={project.title}
        />
      </section>

      {nextProject ? (
        <section className="section-shell section-space-tight pt-0">
          <div className="dark-panel rounded-[1.5rem] p-5 text-white sm:rounded-[2.5rem] sm:p-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="space-y-4">
                <p className="eyebrow text-white/70 before:bg-accent">
                  Next project
                </p>
                <h2 className="font-[family-name:var(--font-display)] text-4xl uppercase leading-none sm:text-5xl">
                  {nextProject.title}
                </h2>
                <p className="description-copy-compact max-w-xl text-white/80">
                  {nextProject.shortDescription}
                </p>
              </div>

              <div className="grid gap-3 sm:flex sm:flex-wrap sm:gap-4">
                <LinkButton
                  href={`${`/work/${nextProject.slug}`}${
                    activeBusiness
                      ? `?business=${projectBusinessToParam(activeBusiness)}`
                      : ""
                  }`}
                  className="w-full sm:w-auto"
                >
                  View Next
                </LinkButton>
                <Link
                  href={backHref}
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-5 text-xs uppercase tracking-eyebrow text-white/80 hover:text-accent sm:min-h-0 sm:justify-start sm:border-0 sm:px-0"
                >
                  Back to Work
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
