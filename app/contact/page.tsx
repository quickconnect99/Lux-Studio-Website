import type { Metadata } from "next";
import { InquiryForm } from "@/components/sections/inquiry-form";
import { PageHeader } from "@/components/sections/page-header";
import { ContactInfo } from "@/components/ui/contact-info";
import { adaptSiteSettingsToPublishedProjects } from "@/lib/public-portfolio";
import { getPublishedProjects, getSiteSettings } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Lux Studio for films, stills, launches, and campaign work."
};

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
            <p className="mt-5 text-sm leading-7 text-muted">
              {settings.copy.contact.directCopy}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {settings.social.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="muted-pill hover:border-accent hover:text-accent"
                >
                  {item.label}
                </a>
              ))}
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
