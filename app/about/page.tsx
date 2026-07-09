import type { Metadata } from "next";
import Image from "next/image";
import { HorizontalStillStrip } from "@/components/sections/horizontal-still-strip";
import { PageHeader } from "@/components/sections/page-header";
import { Reveal } from "@/components/ui/reveal";
import { dedupeImageUrls } from "@/lib/project-images";
import { adaptSiteSettingsToPublishedProjects } from "@/lib/public-portfolio";
import { getPublishedProjects, getSiteSettings } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "About",
  description: "Founder note and studio approach behind Lux Studio."
};

export default async function AboutPage() {
  const [projects, settings] = await Promise.all([
    getPublishedProjects(),
    getSiteSettings()
  ]);

  const publicSettings = adaptSiteSettingsToPublishedProjects(
    settings,
    projects
  );
  const stills = dedupeImageUrls(
    projects.flatMap((project) => project.galleryImages)
  ).slice(0, 6);
  const founderImages = [
    stills[0] ?? "/images/demo-car-02.jpg",
    stills[1] ?? "/images/demo-car-03.jpg"
  ];

  const { about } = publicSettings;

  return (
    <>
      <PageHeader
        eyebrow={publicSettings.copy.about.eyebrow}
        lead={publicSettings.copy.about.headlineLead}
        trail={publicSettings.copy.about.headlineTrail}
        copy={about.positioning}
      />

      <section className="section-shell pb-12">
        <div className="grid gap-6 lg:grid-cols-2">
          {founderImages.map((image, index) => (
            <Reveal
              key={image}
              delay={index * 0.08}
              direction={index === 0 ? "left" : "right"}
              className="overflow-hidden rounded-[1.5rem] border border-line bg-panel-secondary sm:rounded-[2rem]"
            >
              <div className="relative aspect-[4/5]">
                <Image
                  src={image}
                  alt={`Lux Studio founder visual ${index + 1}`}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-6 max-w-3xl">
          <p className="text-base leading-8 text-muted sm:text-lg">
            {about.founderNote}
          </p>
        </div>
      </section>

      <HorizontalStillStrip images={stills} />
    </>
  );
}
