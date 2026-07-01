import React from "react";
import { BusinessFocus } from "@/components/sections/business-focus";
import { FeaturedProjects } from "@/components/sections/featured-projects";
import { HomeHero } from "@/components/sections/home-hero";
import { HorizontalStillStrip } from "@/components/sections/horizontal-still-strip";
import { LinkButton } from "@/components/ui/link-button";
import { Reveal } from "@/components/ui/reveal";
import { RevealList } from "@/components/ui/reveal-list";
import { dedupeImageUrls } from "@/lib/project-images";
import { projectBusinessToParam } from "@/lib/project-business";
import {
  adaptSiteSettingsToPublishedProjects,
  hasPublishedHospitalityProject
} from "@/lib/public-portfolio";
import { isPublicAdminEnabled } from "@/lib/site-config";
import { getPublishedProjects, getSiteSettings } from "@/lib/supabase";

export default async function HomePage() {
  const [projects, settings] = await Promise.all([
    getPublishedProjects(),
    getSiteSettings()
  ]);

  const publicSettings = adaptSiteSettingsToPublishedProjects(
    settings,
    projects
  );
  const hasHospitality = hasPublishedHospitalityProject(projects);
  const featuredProjects = projects
    .filter((project) => project.featured)
    .slice(0, 3);
  const galleryImages = dedupeImageUrls(
    projects.flatMap((project) => project.galleryImages)
  ).slice(0, 8);
  const carProject = projects.find((project) => project.business === "Car");
  const hospitalityProject = projects.find(
    (project) => project.business === "Hospitality"
  );
  const businessCards = [
    {
      business: "Car" as const,
      title: "Car Projects",
      eyebrow: carProject?.title ?? "Launch films, stills, and motion systems",
      description:
        carProject?.shortDescription ??
        "Launch films, rolling motion, and still-image sets for automotive work.",
      imageSrc: carProject?.coverImage ?? "/images/demo-car-01.jpg",
      imageAlt: carProject?.title ?? "Car project preview",
      href: `/work?business=${projectBusinessToParam("Car")}`
    },
    ...(hasHospitality && hospitalityProject
      ? [
          {
            business: "Hospitality" as const,
            title: "Hospitality Projects",
            eyebrow: hospitalityProject.title,
            description: hospitalityProject.shortDescription,
            imageSrc: hospitalityProject.coverImage,
            imageAlt: hospitalityProject.title,
            href: `/work?business=${projectBusinessToParam("Hospitality")}`
          }
        ]
      : [])
  ];

  return (
    <>
      <HomeHero
        hero={publicSettings.hero}
        copy={publicSettings.copy.home}
        posterSrc={publicSettings.seo.ogImage}
      />

      <section className="section-shell">
        <div className="no-scrollbar -mx-4 flex items-center gap-5 overflow-x-auto border-y border-line px-4 py-4 sm:mx-0 sm:flex-wrap sm:gap-x-8 sm:gap-y-3 sm:px-0 sm:py-5">
          <p className="shrink-0 whitespace-nowrap text-xs uppercase tracking-eyebrow text-muted">
            {publicSettings.copy.home.selectedWorkLabel}
          </p>
          {[
            ...new Set(
              projects.map((project) => project.carModel.split(" ")[0])
            )
          ].map((brand, index) => (
            <React.Fragment key={brand}>
              {index > 0 && (
                <span className="text-line" aria-hidden>
                  /
                </span>
              )}
              <span className="text-foreground/60 shrink-0 whitespace-nowrap text-sm font-medium uppercase tracking-[0.14em]">
                {brand}
              </span>
            </React.Fragment>
          ))}
        </div>
      </section>

      <section className="section-shell section-space-tight">
        <div className="grid gap-7 border-y border-line py-7 sm:gap-10 sm:py-8 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal className="space-y-5">
            <p className="eyebrow">{publicSettings.copy.home.brandEyebrow}</p>
            <h2 className="font-[family:var(--font-display)] text-[2.5rem] uppercase leading-[0.92] sm:text-5xl">
              {publicSettings.copy.home.brandHeadlineLead}
              <span className="block pl-5 text-accent sm:pl-12">
                {publicSettings.copy.home.brandHeadlineTrail}
              </span>
            </h2>
          </Reveal>

          <Reveal delay={0.1} direction="right" className="space-y-5">
            <p className="max-w-2xl text-base leading-8 text-muted sm:text-lg">
              {publicSettings.brand.strapline}
            </p>
            <div className="hidden gap-4 sm:grid sm:grid-cols-2">
              {publicSettings.services.slice(0, 4).map((service) => (
                <div
                  key={service.number}
                  className="rounded-[1.25rem] border border-line bg-panel-secondary p-4 text-sm leading-6 text-muted sm:rounded-[1.5rem] sm:p-5 sm:leading-7"
                >
                  <span className="mb-1 block text-xs uppercase tracking-eyebrow text-accent">
                    {service.title}
                  </span>
                  {service.description}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <FeaturedProjects projects={featuredProjects} />

      <BusinessFocus cards={businessCards} />

      <section className="section-shell section-space-tight pt-0">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal className="space-y-5">
            <p className="eyebrow">
              {publicSettings.copy.home.servicesEyebrow}
            </p>
            <h2 className="font-[family:var(--font-display)] text-[2.5rem] uppercase leading-[0.92] sm:text-5xl">
              {publicSettings.copy.home.servicesHeadlineLead}
              <span className="block pl-5 text-accent sm:pl-12">
                {publicSettings.copy.home.servicesHeadlineTrail}
              </span>
            </h2>
            <p className="max-w-md text-sm leading-7 text-muted sm:text-base">
              {publicSettings.brand.strapline}
            </p>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            <RevealList
              items={publicSettings.services.slice(0, 4)}
              getKey={(service) => service.number}
              itemClassName="glass-panel rounded-[1.35rem] p-5 sm:rounded-[1.75rem] sm:p-6"
              render={(service) => (
                <>
                  <p className="metadata-number">{service.number}</p>
                  <h3 className="mt-4 text-lg uppercase tracking-[0.18em] text-foreground">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted">
                    {service.description}
                  </p>
                </>
              )}
            />
          </div>
        </div>
      </section>

      <HorizontalStillStrip images={galleryImages.slice(0, 6)} />

      <section className="section-shell section-space-tight pt-0">
        <div className="dark-panel rounded-[1.5rem] p-5 text-white sm:rounded-[2.5rem] sm:p-12">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-5">
              <p className="eyebrow text-white/70 before:bg-accent">
                {publicSettings.copy.home.ctaEyebrow}
              </p>
              <h2 className="font-[family:var(--font-display)] text-[2.5rem] uppercase leading-[0.92] sm:text-6xl">
                {publicSettings.copy.home.ctaHeadlineLead}
                <span className="block pl-5 text-accent sm:pl-12">
                  {publicSettings.copy.home.ctaHeadlineTrail}
                </span>
              </h2>
              <p className="max-w-2xl text-base leading-8 text-white/80">
                {publicSettings.copy.home.ctaCopy}
              </p>
            </div>
            <div className="flex flex-col justify-end gap-6">
              <div className="grid gap-3 sm:flex sm:flex-wrap sm:gap-4">
                <LinkButton href="/work" className="w-full sm:w-auto">
                  {publicSettings.copy.home.ctaButton}
                </LinkButton>
                {isPublicAdminEnabled ? (
                  <LinkButton href="/admin" variant="secondary" className="w-full sm:w-auto">
                    Open Admin
                  </LinkButton>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
