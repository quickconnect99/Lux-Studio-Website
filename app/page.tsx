import { BusinessFocus } from "@/components/sections/business-focus";
import { FeaturedProjects } from "@/components/sections/featured-projects";
import { HomeHero } from "@/components/sections/home-hero";
import { HorizontalStillStrip } from "@/components/sections/horizontal-still-strip";
import { SelectedFrames } from "@/components/sections/selected-frames";
import { LinkButton } from "@/components/ui/link-button";
import { buildFrameItems } from "@/lib/project-images";
import { projectBusinessToParam } from "@/lib/project-business";
import { adaptSiteSettingsToPublishedProjects } from "@/lib/public-portfolio";
import { isPublicAdminEnabled } from "@/lib/site-config";
import { getPublishedProjects, getSiteSettings } from "@/lib/supabase";

const homepageFrameFallbacks = [
  "/images/sourced/porsche-911-turbo-s-01.jpg",
  "/images/sourced/bmw-m4-competition-01.jpg",
  "/images/sourced/ferrari-roma-spider-01.jpg",
  "/images/sourced/aston-martin-vantage-01.jpg",
  "/images/car-pictures/midnight-aeroline-03.jpg",
  "/images/car-pictures/alpine-vector-01.avif"
];

export default async function HomePage() {
  const [projects, settings] = await Promise.all([
    getPublishedProjects(),
    getSiteSettings()
  ]);

  const publicSettings = adaptSiteSettingsToPublishedProjects(
    settings,
    projects
  );
  const featuredProjects = projects
    .filter((project) => project.featured)
    .slice(0, 5);
  const galleryFrames = buildFrameItems({
    selectedFrames: publicSettings.selectedFrames,
    fallbackImages: homepageFrameFallbacks,
    galleryImages: projects.flatMap((project) => project.galleryImages)
  }).slice(0, 8);
  const businessCards = Array.from(
    new Map(projects.map((project) => [project.business, project])).values()
  )
    .slice(0, 4)
    .map((project) => ({
      business: project.business,
      title: `${project.business} Projects`,
      eyebrow: project.title,
      description: project.shortDescription,
      imageSrc: project.coverImage,
      imageAlt: project.title,
      href: `/work?business=${projectBusinessToParam(project.business)}`
    }));

  return (
    <>
      <HomeHero
        hero={publicSettings.hero}
        copy={publicSettings.copy.home}
        posterSrc={publicSettings.seo.ogImage}
      />

      <SelectedFrames frames={galleryFrames.slice(0, 8)} />

      <HorizontalStillStrip
        frames={galleryFrames.slice(0, 6)}
        direction="right"
        collapsible
        eyebrow="Motion reference"
        lead="Frames"
        trail="In Motion"
      />

      <FeaturedProjects projects={featuredProjects} />

      <BusinessFocus cards={businessCards} />

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
