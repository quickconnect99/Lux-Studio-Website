import type { Metadata } from "next";
import { Film } from "lucide-react";
import { PageHeader } from "@/components/sections/page-header";
import { RevealList } from "@/components/ui/reveal-list";
import { serviceIcons } from "@/lib/content";
import { adaptSiteSettingsToPublishedProjects } from "@/lib/public-portfolio";
import { getPublishedProjects, getSiteSettings } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Commercial shoots, social content, event coverage, and brand campaigns."
};

export default async function ServicesPage() {
  const [rawSettings, projects] = await Promise.all([
    getSiteSettings(),
    getPublishedProjects()
  ]);
  const settings = adaptSiteSettingsToPublishedProjects(rawSettings, projects);

  return (
    <>
      <PageHeader
        eyebrow={settings.copy.services.eyebrow}
        lead={settings.copy.services.headlineLead}
        trail={settings.copy.services.headlineTrail}
        copy={settings.copy.services.copy}
      />

      <section className="section-shell section-space-tight pt-0">
        <div className="grid gap-5">
          <RevealList
            items={settings.services}
            getKey={(s) => s.number}
            itemClassName="grid gap-6 rounded-[2rem] border border-line bg-panel-secondary p-6 shadow-card lg:grid-cols-[140px_1fr_0.9fr]"
            render={(service) => {
              const Icon = serviceIcons[service.number] ?? Film;
              return (
                <>
                  {/* Service number + icon */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.75rem] border border-line bg-panel">
                      <Icon className="h-4 w-4 text-accent" />
                    </div>
                    <span className="metadata-number pt-2.5">
                      {service.number}
                    </span>
                  </div>

                  {/* Title + description */}
                  <div className="space-y-4">
                    <h2 className="font-[family:var(--font-display)] text-4xl uppercase leading-none">
                      {service.title}
                    </h2>
                    <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">
                      {service.description}
                    </p>
                  </div>

                  {/* Deliverables */}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    {service.deliverables.map((item) => (
                      <div
                        key={item}
                        className="metadata-card metadata-label border-l-2 border-l-accent pl-4"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </>
              );
            }}
          />
        </div>
      </section>
    </>
  );
}
