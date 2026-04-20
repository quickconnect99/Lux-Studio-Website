import React from "react";
import { BusinessFocus } from "@/components/sections/business-focus";
import { FeaturedProjects } from "@/components/sections/featured-projects";
import { HomeHero } from "@/components/sections/home-hero";
import { HorizontalStillStrip } from "@/components/sections/horizontal-still-strip";
import { LinkButton } from "@/components/ui/link-button";
import { Reveal } from "@/components/ui/reveal";
import { RevealList } from "@/components/ui/reveal-list";
import { projectBusinessToParam } from "@/lib/project-business";
import { isPublicAdminEnabled } from "@/lib/site-config";
import { getPublishedProjects, getSiteSettings } from "@/lib/supabase";

export default async function HomePage() {
  const [projects, settings] = await Promise.all([
    getPublishedProjects(),
    getSiteSettings()
  ]);

  const featuredProjects = projects
    .filter((project) => project.featured)
    .slice(0, 3);
  const galleryImages = projects
    .flatMap((project) => project.galleryImages)
    .slice(0, 8);
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
        "Cinematic launch content, rolling motion, and premium still systems for automotive campaigns.",
      imageSrc: carProject?.coverImage ?? "/images/demo-car-01.jpg",
      imageAlt: carProject?.title ?? "Car project preview",
      href: `/work?business=${projectBusinessToParam("Car")}`
    },
    {
      business: "Hospitality" as const,
      title: "Hospitality Projects",
      eyebrow:
        hospitalityProject?.title ??
        "Hotels, spaces, dining concepts, and launch atmospheres",
      description:
        hospitalityProject?.shortDescription ??
        "Editorial films and stills for hospitality brands that need a property to feel designed before a guest arrives.",
      imageSrc:
        hospitalityProject?.coverImage ??
        "/images/hospitality/quiet-arrival-cover.svg",
      imageAlt: hospitalityProject?.title ?? "Hospitality project preview",
      href: `/work?business=${projectBusinessToParam("Hospitality")}`
    }
  ];

  return (
    <>
      <HomeHero hero={settings.hero} posterSrc={settings.seo.ogImage} />

      <section className="section-shell">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-y border-line py-5">
          <p className="shrink-0 text-xs uppercase tracking-eyebrow text-muted">
            Selected work
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
              <span className="text-foreground/60 text-sm font-medium uppercase tracking-[0.14em]">
                {brand}
              </span>
            </React.Fragment>
          ))}
        </div>
      </section>

      <section className="section-shell section-space-tight">
        <div className="grid gap-10 border-y border-line py-8 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal className="space-y-5">
            <p className="eyebrow">Brand statement</p>
            <h2 className="font-[family:var(--font-display)] text-4xl uppercase leading-none sm:text-5xl">
              Cinematic
              <span className="block pl-8 text-accent sm:pl-12">
                Visual Stories
              </span>
            </h2>
          </Reveal>

          <Reveal delay={0.1} direction="right" className="space-y-5">
            <p className="max-w-2xl text-base leading-8 text-muted sm:text-lg">
              {settings.brand.strapline}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {settings.services.slice(0, 4).map((service) => (
                <div
                  key={service.number}
                  className="rounded-[1.5rem] border border-line bg-panel-secondary p-5 text-sm leading-7 text-muted"
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
            <p className="eyebrow">Services snapshot</p>
            <h2 className="font-[family:var(--font-display)] text-4xl uppercase leading-none sm:text-5xl">
              Built
              <span className="block pl-8 text-accent sm:pl-12">
                For Campaigns
              </span>
            </h2>
            <p className="max-w-md text-sm leading-7 text-muted sm:text-base">
              {settings.brand.strapline}
            </p>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            <RevealList
              items={settings.services.slice(0, 4)}
              getKey={(service) => service.number}
              itemClassName="glass-panel rounded-[1.75rem] p-6"
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
        <div className="dark-panel rounded-[2.5rem] p-8 text-white sm:p-12">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-5">
              <p className="eyebrow text-white/70 before:bg-accent">
                Next Project
              </p>
              <h2 className="font-[family:var(--font-display)] text-4xl uppercase leading-none sm:text-6xl">
                Ready
                <span className="block pl-8 text-accent sm:pl-12">
                  To Launch
                </span>
              </h2>
              <p className="max-w-2xl text-base leading-8 text-white/80">
                {settings.brand.strapline}
              </p>
            </div>
            <div className="flex flex-col justify-between gap-6">
              <p className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 text-sm leading-7 text-white/70">
                {settings.brand.strapline}
              </p>
              <div className="flex flex-wrap gap-4">
                <LinkButton href="/work">Browse Work</LinkButton>
                {isPublicAdminEnabled ? (
                  <LinkButton href="/admin" variant="secondary">
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
