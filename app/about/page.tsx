import type { Metadata } from "next";
import { HorizontalStillStrip } from "@/components/sections/horizontal-still-strip";
import { PageHeader } from "@/components/sections/page-header";
import { Reveal } from "@/components/ui/reveal";
import { RevealList } from "@/components/ui/reveal-list";
import { getPublishedProjects, getSiteSettings } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "About",
  description:
    "A concise founder and studio story for a premium campaign studio spanning automotive and hospitality."
};

export default async function AboutPage() {
  const [projects, settings] = await Promise.all([
    getPublishedProjects(),
    getSiteSettings()
  ]);

  const stills = projects
    .flatMap((project) => project.galleryImages)
    .slice(0, 6);

  const { about } = settings;

  return (
    <>
      <PageHeader
        eyebrow="Studio profile"
        lead="Story"
        trail="And Intent"
        copy={about.positioning}
      />

      <section className="section-shell pb-12">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal className="panel-2xl p-8">
            <p className="text-xs uppercase tracking-eyebrow text-muted">
              Founder note
            </p>
            <p className="mt-5 text-base leading-8 text-muted">
              {about.founderNote}
            </p>
          </Reveal>
          <Reveal delay={0.08} direction="right" className="panel-2xl p-8">
            <p className="text-xs uppercase tracking-eyebrow text-muted">
              Positioning
            </p>
            <p className="mt-5 text-base leading-8 text-muted">
              {about.positioning}
            </p>
          </Reveal>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          <RevealList
            items={about.values}
            getKey={(v) => v.title}
            itemClassName="rounded-[1.75rem] border border-line bg-panel-secondary p-6"
            render={(v) => (
              <>
                <p className="text-xs uppercase tracking-eyebrow text-accent">
                  {v.title}
                </p>
                <p className="mt-4 text-sm leading-7 text-muted">{v.copy}</p>
              </>
            )}
          />
        </div>
      </section>

      <HorizontalStillStrip images={stills} />
    </>
  );
}
