import type { Metadata } from "next";
import Script from "next/script";
import { InquiryForm } from "@/components/sections/inquiry-form";
import { buildInquiryServiceOptions } from "@/components/sections/service-inquiry-options";
import { PageHeader } from "@/components/sections/page-header";
import { ContactInfo } from "@/components/ui/contact-info";
import { SocialLinks } from "@/components/ui/social-links";
import { serializeJsonLd } from "@/lib/json-ld";
import {
  buildSharingMetadata,
  resolveSharingImage
} from "@/lib/sharing-metadata";
import { buildPageStructuredData } from "@/lib/site-structured-data";
import { getSiteSettings } from "@/lib/supabase";
import type { InquiryServiceType } from "@/lib/types";

const pageTitle = "Contact";
const pageDescription =
  "Contact Lux Studio for films, stills, launches, and campaign work.";

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
      canonical: "/contact"
    },
    ...buildSharingMetadata({
      title: `${pageTitle} | ${settings.brand.name}`,
      description: pageDescription,
      image,
      imageAlt: `${settings.brand.name} featured still`,
      siteName: settings.brand.name
    })
  };
}

type ContactPageProps = {
  searchParams?: Promise<{ service?: string | string[] }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const settings = await getSiteSettings();
  const serviceOptions = buildInquiryServiceOptions(settings.services);
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const requestedService = Array.isArray(resolvedSearchParams.service)
    ? resolvedSearchParams.service[0]
    : resolvedSearchParams.service;
  const initialServiceType = serviceOptions.some(
    (option) => option.value === requestedService
  )
    ? (requestedService as InquiryServiceType)
    : "";
  const structuredData = buildPageStructuredData({
    name: pageTitle,
    description: pageDescription,
    path: "/contact",
    type: "ContactPage"
  });

  return (
    <>
      <Script
        id="schema-contact-page"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />
      <PageHeader
        eyebrow={settings.copy.contact.eyebrow}
        lead={settings.copy.contact.headlineLead}
        trail={settings.copy.contact.headlineTrail}
        copy={settings.copy.contact.copy}
      />

      <section className="section-shell section-space-tight pt-0">
        <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
          {/* Direct contact panel */}
          <div className="panel-2xl p-5 sm:p-8">
            <p className="text-xs uppercase tracking-eyebrow text-muted">
              {settings.copy.contact.directLabel}
            </p>

            <div className="mt-6">
              <ContactInfo contact={settings.contact} showIcons />
            </div>
            <p className="description-copy-compact mt-5 text-muted">
              {settings.copy.contact.directCopy}
            </p>

            <div className="mt-8">
              <SocialLinks links={settings.social} />
            </div>
          </div>

          <InquiryForm
            label={settings.copy.contact.formLabel}
            submitLabel={settings.copy.contact.submitLabel}
            serviceOptions={serviceOptions}
            initialServiceType={initialServiceType}
          />
        </div>
      </section>
    </>
  );
}
