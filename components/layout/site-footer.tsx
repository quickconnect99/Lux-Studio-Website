import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import { ContactInfo } from "@/components/ui/contact-info";
import { SocialLinks } from "@/components/ui/social-links";
import { getVisibleNavigation } from "@/lib/site-config";

type SiteFooterProps = {
  settings: SiteSettings;
};

export function SiteFooter({ settings }: SiteFooterProps) {
  const navigation = getVisibleNavigation(settings.navigation);

  return (
    <footer className="border-t border-line pb-24 pt-9 sm:pb-8 sm:pt-10">
      {/*
       * Layout:
       *   mobile  – single column
       *   tablet  – 2 columns (brand | nav + contact stacked)
       *   desktop – 3 asymmetric columns [1.4fr 1fr 1fr]
       */}
      <div className="section-shell grid gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-[1.4fr_1fr_1fr]">
        {/* Brand statement – spans full width on tablet, left col on desktop */}
        <div className="space-y-5 sm:col-span-2 lg:col-span-1">
          <p className="eyebrow">{settings.brand.name}</p>
          <h2 className="max-w-xl font-[family-name:var(--font-display)] text-[2.5rem] leading-[0.95] text-foreground sm:text-5xl">
            {settings.copy.footer.headline}
          </h2>
          <p className="description-copy-compact max-w-md text-muted">
            {settings.brand.strapline}
          </p>
        </div>

        {/* Navigation */}
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-eyebrow text-muted">
            {settings.copy.footer.navigationLabel}
          </p>
          <div className="flex flex-col gap-3 text-sm uppercase tracking-meta">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex min-h-11 w-fit items-center transition-colors duration-150 hover:text-accent"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Contact + socials */}
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-eyebrow text-muted">
            {settings.copy.footer.connectLabel}
          </p>
          <ContactInfo contact={settings.contact} />
          <SocialLinks links={settings.social} />
        </div>
      </div>

      <div className="section-shell mt-8 grid gap-4 border-t border-line pt-5 text-xs uppercase tracking-ui text-muted sm:mt-10 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/impressum"
            className="inline-flex min-h-11 items-center transition-colors duration-150 hover:text-accent"
          >
            Legal Notice
          </Link>
          <Link
            href="/datenschutz"
            className="inline-flex min-h-11 items-center transition-colors duration-150 hover:text-accent"
          >
            Privacy Policy
          </Link>
        </div>
        <p className="text-muted/80 max-w-sm text-[0.62rem] leading-5 tracking-[0.18em] sm:text-right sm:text-[0.68rem] sm:tracking-[0.22em]">
          {settings.copy.footer.mediaNotice}
        </p>
      </div>
    </footer>
  );
}
