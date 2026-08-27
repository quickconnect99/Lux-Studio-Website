import { BusinessFocus } from "@/components/sections/business-focus";
import { FeaturedProjects } from "@/components/sections/featured-projects";
import { HomeHero } from "@/components/sections/home-hero";
import { HorizontalStillStrip } from "@/components/sections/horizontal-still-strip";
import { SelectedFrames } from "@/components/sections/selected-frames";
import { LinkButton } from "@/components/ui/link-button";
import { buildFrameItems, buildProjectFrameItems } from "@/lib/project-images";
import { projectBusinessToParam } from "@/lib/project-business";
import { isPublicAdminEnabled } from "@/lib/site-config";
import { getPublishedProjects, getSiteSettings } from "@/lib/supabase";

const homepageFrameFallbacks = [
  "/images/sourced/porsche-911-turbo-s-01.jpg",
  "/images/sourced/bmw-m4-competition-01.jpg",
  "/images/sourced/ferrari-roma-spider-01.jpg",
  "/images/sourced/porsche-taycan-turbo-s-01.jpg",
  "/images/car-pictures/midnight-aeroline-03.jpg",
  "/images/car-pictures/alpine-vector-01.avif"
];

export default async function HomePage() {
  const [projects, settings] = await Promise.all([
    getPublishedProjects(),
    getSiteSettings()
  ]);

  const featuredProjects = projects
    .filter((project) => project.featured)
    .slice(0, 3);
  const galleryFrames = buildFrameItems({
    selectedFrames: settings.selectedFrames,
    fallbackImages: homepageFrameFallbacks,
    galleryImages: projects.flatMap((project) => project.galleryImages)
  });
  const motionFrames = buildProjectFrameItems(projects, settings.motionFrames);
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
      imageAlt: `${project.title}, ${project.business.toLowerCase()} project in ${project.location}`,
      href: `/work?business=${projectBusinessToParam(project.business)}`
    }));

  return (
    <>
      <HomeHero hero={settings.hero} copy={settings.copy.home} />

      <SelectedFrames
        frames={galleryFrames}
        label={settings.copy.home.selectedWorkLabel}
      />

      <HorizontalStillStrip
        frames={motionFrames}
        direction="right"
        eyebrow="Motion reference"
        lead="Frames"
        trail="In Motion"
        ariaLabel="Frames in Motion projects. Select an image to open the related project."
        imageAltPrefix="Project frame"
      />

      <FeaturedProjects projects={featuredProjects} />

      <BusinessFocus cards={businessCards} />

      <section className="section-shell section-space-tight pt-0">
        <div className="dark-panel rounded-[1.5rem] p-5 text-white sm:rounded-[2.5rem] sm:p-12">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-5">
              <p className="eyebrow text-white/70 before:bg-accent">
                {settings.copy.home.ctaEyebrow}
              </p>
              <h2 className="font-[family-name:var(--font-display)] text-[2.5rem] uppercase leading-[0.92] sm:text-6xl">
                {settings.copy.home.ctaHeadlineLead}
                <span className="block pl-5 text-accent sm:pl-12">
                  {settings.copy.home.ctaHeadlineTrail}
                </span>
              </h2>
              <p className="max-w-2xl text-base leading-8 text-white/80">
                {settings.copy.home.ctaCopy}
              </p>
            </div>
            <div className="flex flex-col justify-end gap-6">
              <div className="grid gap-3 sm:flex sm:flex-wrap sm:gap-4">
                <LinkButton href="/work" className="w-full sm:w-auto">
                  {settings.copy.home.ctaButton}
                </LinkButton>
                {isPublicAdminEnabled ? (
                  <LinkButton
                    href="/admin"
                    variant="secondary"
                    className="w-full sm:w-auto"
                  >
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
