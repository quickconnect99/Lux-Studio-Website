import type { Metadata } from "next";
import { InquiryForm } from "@/components/sections/inquiry-form";
import { PageHeader } from "@/components/sections/page-header";
import { ContactInfo } from "@/components/ui/contact-info";
import { getSiteSettings } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Minimal contact form and direct inquiry details for automotive and hospitality campaign work."
};

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <PageHeader
        eyebrow="Start a project"
        lead="Let's"
        trail="Talk Motion"
        copy="A concise inquiry flow for campaign films, stills, launches, properties, and premium brand content."
      />

      <section className="section-shell section-space-tight pt-0">
        <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
          {/* Direct contact panel */}
          <div className="panel-2xl p-8">
            <p className="text-xs uppercase tracking-eyebrow text-muted">
              Direct contact
            </p>

            <div className="mt-6">
              <ContactInfo contact={settings.contact} showIcons />
            </div>
            <p className="mt-5 text-sm leading-7 text-muted">
              Typical inquiries: launch films, campaign visuals, property
              content, social cutdowns, guest-experience edits, and premium
              event coverage.
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

          <InquiryForm />
        </div>
      </section>
    </>
  );
}
