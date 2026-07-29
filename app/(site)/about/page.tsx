import type { Metadata } from "next";
import Script from "next/script";
import { HorizontalStillStrip } from "@/components/sections/horizontal-still-strip";
import { PageHeader } from "@/components/sections/page-header";
import { TeamTabs } from "@/components/sections/team-tabs";
import { Reveal } from "@/components/ui/reveal";
import { serializeJsonLd } from "@/lib/json-ld";
import { adaptSiteSettingsToPublishedProjects } from "@/lib/public-portfolio";
import {
  buildSharingMetadata,
  resolveSharingImage
} from "@/lib/sharing-metadata";
import { buildPageStructuredData } from "@/lib/site-structured-data";
import { getPublishedProjects, getSiteSettings } from "@/lib/supabase";

const pageTitle = "About";
const pageDescription = "Founder note and studio approach behind Lux Studio.";

export async function generateMetadata(): Promise<Metadata> {
  const [projects, settings] = await Promise.all([
    getPublishedProjects(),
    getSiteSettings()
  ]);
  const image = resolveSharingImage({
    preferredImages: [
      ...settings.about.teamGallery,
      ...projects.flatMap((project) => project.galleryImages),
      ...settings.about.teamMembers.map((member) => member.image)
    ],
    projects,
    settings
  });

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: "/about"
    },
    ...buildSharingMetadata({
      title: `${pageTitle} | ${settings.brand.name}`,
      description: pageDescription,
      image,
      imageAlt: `${settings.brand.name} studio still`,
      siteName: settings.brand.name
    })
  };
}

export default async function AboutPage() {
  const [projects, settings] = await Promise.all([
    getPublishedProjects(),
    getSiteSettings()
  ]);

  const publicSettings = adaptSiteSettingsToPublishedProjects(
    settings,
    projects
  );
  const teamMembers = publicSettings.about.teamMembers;

  const { about } = publicSettings;
  const structuredData = buildPageStructuredData({
    name: pageTitle,
    description: pageDescription,
    path: "/about",
    type: "AboutPage"
  });

  return (
    <>
      <Script
        id="schema-about-page"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />
      <PageHeader
        eyebrow={publicSettings.copy.about.eyebrow}
        lead={publicSettings.copy.about.headlineLead}
        trail={publicSettings.copy.about.headlineTrail}
        copy={about.positioning}
        copyLabel={publicSettings.copy.about.positioningLabel}
      />

      <section className="section-shell pb-12">
        <Reveal className="max-w-3xl space-y-3">
          <p className="eyebrow">{publicSettings.copy.about.founderLabel}</p>
          <p className="text-base leading-8 text-muted sm:text-lg">
            {about.founderNote}
          </p>
        </Reveal>
      </section>

      {about.values.length > 0 ? (
        <section className="section-shell section-space-tight pt-0">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {about.values.map((value, index) => (
              <Reveal
                key={`${value.title}-${index}`}
                delay={index * 0.06}
                className="rounded-[1.5rem] border border-line bg-panel-secondary p-6 sm:rounded-[2rem] sm:p-8"
              >
                <p className="text-xs uppercase tracking-eyebrow text-accent-text">
                  {value.title}
                </p>
                <p className="mt-4 text-base leading-8 text-muted">
                  {value.copy}
                </p>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      <TeamTabs members={teamMembers} />

      <HorizontalStillStrip
        images={about.teamGallery}
        eyebrow="Team Gallery"
        lead="People"
        trail="At Work"
        ariaLabel="Team photo gallery. Use the left and right arrow keys to scroll through the images."
        imageAltPrefix="Team photo"
      />
    </>
  );
}
