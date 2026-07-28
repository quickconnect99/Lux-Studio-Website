import type { Metadata } from "next";
import { InquiryForm } from "@/components/sections/inquiry-form";
import { PageHeader } from "@/components/sections/page-header";
import { ContactInfo } from "@/components/ui/contact-info";
import { SocialLinks } from "@/components/ui/social-links";
import { adaptSiteSettingsToPublishedProjects } from "@/lib/public-portfolio";
import {
  buildSharingMetadata,
  resolveSharingImage
} from "@/lib/sharing-metadata";
import { getPublishedProjects, getSiteSettings } from "@/lib/supabase";

const pageTitle = "Contact";
const pageDescription =
  "Contact Lux Studio for films, stills, launches, and campaign work.";

export async function generateMetadata(): Promise<Metadata> {
  const [projects, settings] = await Promise.all([
    getPublishedProjects(),
    getSiteSettings()
  ]);
  const image = resolveSharingImage({
    preferredImages: settings.selectedFrames,
    projects,
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

export default async function ContactPage() {
  const [rawSettings, projects] = await Promise.all([
    getSiteSettings(),
    getPublishedProjects()
  ]);
  const settings = adaptSiteSettingsToPublishedProjects(rawSettings, projects);

  return (
    <>
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
          />
        </div>
      </section>
    </>
  );
}
