import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import { MetadataGrid } from "@/components/ui/metadata-grid";
import { ProjectMedia } from "@/components/sections/project-media";
import { LinkButton } from "@/components/ui/link-button";
import { Reveal } from "@/components/ui/reveal";
import { RevealList } from "@/components/ui/reveal-list";
import { normalizeProjectGallery } from "@/lib/project-images";
import {
  getProjectPrimaryMetaLabel,
  parseProjectBusinessParam,
  projectBusinessToParam
} from "@/lib/project-business";
import {
  getProjectBySlug,
  getPublishedProjects,
  getSiteSettings
} from "@/lib/supabase";
import { siteConfig } from "@/lib/site-config";

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
    return {};
  }

  const title = `${project.title} | ${settings.brand.name}`;

  return {
    title,
    description: project.shortDescription,
    alternates: {
      canonical: `/work/${project.slug}`
    },
    openGraph: {
      title,
      description: project.shortDescription,
      type: "article",
      siteName: settings.brand.name,
      images: [
        {
          url: project.coverImage,
          alt: `${project.title} cover still`
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: project.shortDescription,
      images: [project.coverImage]
    }
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
    ? publishedProjects.filter((entry) => entry.business === activeBusiness)
    : publishedProjects;
  const navigableProjects =
    businessScopedProjects.length > 0
      ? businessScopedProjects
      : publishedProjects;
  const currentIndex = navigableProjects.findIndex(
    (entry) => entry.slug === project.slug
  );
  const nextProject =
    navigableProjects[(currentIndex + 1) % navigableProjects.length];
  const normalizedGallery = normalizeProjectGallery({
    coverImage: project.coverImage,
    galleryImages: project.galleryImages,
    galleryCaptions: project.galleryCaptions ?? []
  });
  const heroStill = normalizedGallery.images[0] ?? null;
  const supportingStillItems = normalizedGallery.images
    .slice(1)
    .map((image, index) => ({
      image,
      caption: normalizedGallery.captions[index + 1] ?? ""
    }));

  const videoUrl = project.videoUrl || project.uploadedVideo;
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteConfig.siteUrl
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Work",
        item: `${siteConfig.siteUrl}/work`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: project.title,
        item: `${siteConfig.siteUrl}/work/${project.slug}`
      }
    ]
  };
  const videoSchema = videoUrl
    ? {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: project.title,
        description: project.shortDescription,
        thumbnailUrl: project.coverImage,
        uploadDate: project.createdAt,
        contentUrl: videoUrl
      }
    : null;

  return (
    <div>
      <Script
        id={`schema-breadcrumb-${project.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {videoSchema && (
        <Script
          id={`schema-video-${project.slug}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
        />
      )}
      <section className="section-shell pb-10 pt-14 sm:pt-20">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal className="space-y-6">
            <p className="eyebrow">
              {project.business} / {project.category}
            </p>
            <h1 className="font-[family:var(--font-display)] text-5xl uppercase leading-[0.9] tracking-[-0.05em] text-foreground sm:text-7xl">
              {project.title.split(" ")[0]}
              <span className="block pl-8 text-accent sm:pl-14">
                {project.title.split(" ").slice(1).join(" ")}
              </span>
            </h1>
            <p className="max-w-xl text-base leading-8 text-muted sm:text-lg">
              {project.shortDescription}
            </p>
            <MetadataGrid
              items={[
                {
                  label: getProjectPrimaryMetaLabel(project.business),
                  value: project.carModel
                },
                { label: "Location", value: project.location },
                { label: "Year", value: String(project.year) }
              ]}
              valueClassName="mt-2 text-sm uppercase tracking-meta text-foreground"
            />
          </Reveal>

          <Reveal delay={0.1} direction="right">
            <ProjectMedia project={project} />
          </Reveal>
        </div>
      </section>

      <section className="section-shell section-space-tight pt-0">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5">
            <p className="eyebrow">Narrative</p>
            <p className="max-w-3xl text-base leading-8 text-muted sm:text-lg">
              {project.fullDescription}
            </p>
          </div>
          <div className="glass-panel rounded-[1.75rem] p-6">
            <p className="text-xs uppercase tracking-eyebrow text-muted">
              Behind the scenes
            </p>
            {project.behindTheScenes && (
              <p className="mt-4 text-sm leading-7 text-muted">
                {project.behindTheScenes}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="section-shell section-space-tight pt-0">
        <div className="space-y-6">
          {heroStill ? (
            <Reveal>
              <div className="film-frame relative overflow-hidden rounded-[2rem]">
                <div className="aspect-[16/9]" />
                <Image
                  src={heroStill}
                  alt={`${project.title} still 1`}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          ) : null}

          {supportingStillItems.length > 0 ? (
            <div className="grid gap-6">
              <RevealList
                items={supportingStillItems}
                getKey={(item) => item.image}
                render={(item, index) =>
                  (() => {
                    const caption = item.caption.trim() || null;

                    if (!caption) {
                      return (
                        <div className="film-frame relative overflow-hidden rounded-[2rem]">
                          <div className="aspect-[16/9]" />
                          <Image
                            src={item.image}
                            alt={`${project.title} still ${index + 2}`}
                            fill
                            sizes="100vw"
                            className="object-cover"
                          />
                        </div>
                      );
                    }

                    return (
                      <div className="overflow-hidden rounded-[2rem] border border-line bg-panel-secondary p-4 shadow-card sm:p-5">
                        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.68fr)_minmax(220px,0.32fr)] lg:items-start">
                          <div className="film-frame relative overflow-hidden rounded-[1.75rem]">
                            <div className="aspect-[4/5]" />
                            <Image
                              src={item.image}
                              alt={`${project.title} still ${index + 2}`}
                              fill
                              sizes="(min-width: 1024px) 46vw, 100vw"
                              className="object-cover"
                            />
                          </div>

                          <div className="flex h-full min-h-[220px] flex-col justify-start gap-6 rounded-[1.5rem] border border-line bg-panel px-5 py-6 sm:px-6">
                            <p className="text-accent/90 font-mono text-[0.72rem] uppercase tracking-[0.28em]">
                              Still 0{index + 2}
                            </p>
                            <p className="text-foreground/82 max-w-[28ch] text-base leading-8 sm:text-[1.02rem]">
                              {caption}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                }
              />
            </div>
          ) : null}
        </div>
      </section>

      <section className="section-shell section-space-tight pt-0">
        <div className="dark-panel rounded-[2.5rem] p-8 text-white sm:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="space-y-4">
              <p className="eyebrow text-white/70 before:bg-accent">
                Next project
              </p>
              <h2 className="font-[family:var(--font-display)] text-4xl uppercase leading-none sm:text-5xl">
                {nextProject.title}
              </h2>
              <p className="max-w-xl text-sm leading-7 text-white/80">
                {nextProject.shortDescription}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <LinkButton
                href={`${`/work/${nextProject.slug}`}${
                  activeBusiness
                    ? `?business=${projectBusinessToParam(activeBusiness)}`
                    : ""
                }`}
              >
                View Next
              </LinkButton>
              <Link
                href={backHref}
                className="inline-flex items-center text-xs uppercase tracking-eyebrow text-white/80 hover:text-accent"
              >
                Back to Work
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
