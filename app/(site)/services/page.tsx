import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import { Film } from "lucide-react";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader } from "@/components/sections/page-header";
import {
  getInquiryServiceType,
  getRelatedProjectCategory
} from "@/components/sections/service-inquiry-options";
import { RevealList } from "@/components/ui/reveal-list";
import { serviceIcons } from "@/lib/content";
import { serializeJsonLd } from "@/lib/json-ld";
import {
  buildSharingMetadata,
  resolveSharingImage
} from "@/lib/sharing-metadata";
import { buildPageStructuredData } from "@/lib/site-structured-data";
import { getSiteSettings, getPublishedProjects } from "@/lib/supabase";

const pageTitle = "Services";
const pageDescription =
  "Commercial shoots, social content, event coverage, and brand campaigns.";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const image = resolveSharingImage({
    preferredImages: settings.selectedFrames,
    settings
  });

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: "/services"
    },
    ...buildSharingMetadata({
      title: `${pageTitle} | ${settings.brand.name}`,
      description: pageDescription,
      image,
      imageAlt: `${settings.brand.name} production still`,
      siteName: settings.brand.name
    })
  };
}

export default async function ServicesPage() {
  const [settings, projects] = await Promise.all([
    getSiteSettings(),
    getPublishedProjects()
  ]);
  const structuredData = buildPageStructuredData({
    name: pageTitle,
    description: pageDescription,
    path: "/services"
  });

  return (
    <>
      <Script
        id="schema-services-page"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />
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
            itemClassName="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-4 rounded-[2rem] border border-line bg-panel-secondary p-5 shadow-card sm:p-6 lg:grid-cols-[80px_1fr_0.9fr]"
            render={(service) => {
              const Icon = serviceIcons[service.number] ?? Film;
              const relatedCategory = getRelatedProjectCategory(
                service,
                projects
              );
              return (
                <>
                  {/* Service number + icon */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.75rem] border border-line bg-panel">
                      <Icon className="h-4 w-4 text-accent-text" />
                    </div>
                    <span className="metadata-number">{service.number}</span>
                  </div>

                  {/* Title + description */}
                  <div className="space-y-3">
                    <h2 className="font-[family-name:var(--font-display)] text-[1.75rem] uppercase leading-none sm:text-4xl">
                      {service.title}
                    </h2>
                    <p className="description-copy-compact max-w-2xl text-muted">
                      {service.description}
                    </p>
                  </div>

                  {/* Deliverables */}
                  <div className="col-span-2 space-y-4 lg:col-span-1">
                    <ul className="grid gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-1">
                      {service.deliverables.map((item) => (
                        <li
                          key={item}
                          className="border-l-2 border-accent pl-3 text-sm text-muted"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                      <LinkButton
                        href={`/contact?service=${encodeURIComponent(
                          getInquiryServiceType(service)
                        )}`}
                        className="w-full sm:w-auto"
                      >
                        Start A Project
                      </LinkButton>
                      <Link
                        href={
                          relatedCategory
                            ? `/work?category=${encodeURIComponent(relatedCategory)}`
                            : "/work"
                        }
                        className="inline-flex min-h-11 items-center text-sm text-foreground underline underline-offset-4"
                      >
                        {relatedCategory ? "Related Work" : "View Portfolio"}
                      </Link>
                    </div>
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
