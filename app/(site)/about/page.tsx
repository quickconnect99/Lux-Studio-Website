import type { Metadata } from "next";
import Script from "next/script";
import { HorizontalStillStrip } from "@/components/sections/horizontal-still-strip";
import { PageHeader } from "@/components/sections/page-header";
import {
  isPlaceholderTeamImage,
  TeamTabs
} from "@/components/sections/team-tabs";
import { Reveal } from "@/components/ui/reveal";
import { serializeJsonLd } from "@/lib/json-ld";
import {
  buildSharingMetadata,
  resolveSharingImage
} from "@/lib/sharing-metadata";
import { buildPageStructuredData } from "@/lib/site-structured-data";
import { getSiteSettings } from "@/lib/supabase";

const pageTitle = "About";
const pageDescription = "Founder note and studio approach behind Lux Studio.";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const image = resolveSharingImage({
    preferredImages: [
      ...settings.about.teamGallery.filter(
        (image) => !isPlaceholderTeamImage(image)
      ),
      ...settings.about.teamMembers
        .map((member) => member.image)
        .filter((image) => !isPlaceholderTeamImage(image)),
      ...settings.selectedFrames
    ],
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
  const settings = await getSiteSettings();
  const teamMembers = settings.about.teamMembers;
  const teamGallery = settings.about.teamGallery.filter(
    (image) => !isPlaceholderTeamImage(image)
  );

  const { about } = settings;
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
        eyebrow={settings.copy.about.eyebrow}
        lead={settings.copy.about.headlineLead}
        trail={settings.copy.about.headlineTrail}
        copy={about.positioning}
        copyLabel={settings.copy.about.positioningLabel}
      />

      <section className="section-shell pb-12">
        <Reveal className="max-w-3xl space-y-3">
          <p className="eyebrow">{settings.copy.about.founderLabel}</p>
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
        images={teamGallery}
        eyebrow="Team Gallery"
        lead="People"
        trail="At Work"
        ariaLabel="Team photo gallery. Use the left and right arrow keys to scroll through the images."
        imageAltPrefix="Team photo"
      />
    </>
  );
}
