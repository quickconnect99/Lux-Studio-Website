import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import { ContactInfo } from "@/components/ui/contact-info";
import { siteConfig } from "@/lib/site-config";

type SiteFooterProps = {
  settings: SiteSettings;
};

export function SiteFooter({ settings }: SiteFooterProps) {
  return (
    <footer className="border-t border-line pb-8 pt-10">
      {/*
       * Layout:
       *   mobile  – single column
       *   tablet  – 2 columns (brand | nav + contact stacked)
       *   desktop – 3 asymmetric columns [1.4fr 1fr 1fr]
       */}
      <div className="section-shell grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        {/* Brand statement – spans full width on tablet, left col on desktop */}
        <div className="space-y-5 sm:col-span-2 lg:col-span-1">
          <p className="eyebrow">{settings.brand.name}</p>
          <h2 className="font-[family:var(--font-display)] max-w-xl text-4xl leading-none text-foreground sm:text-5xl">
            Built for brands and spaces that want to feel seen before they are
            explained.
          </h2>
          <p className="max-w-md text-sm leading-7 text-muted">
            {settings.brand.strapline}
          </p>
        </div>

        {/* Navigation */}
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-eyebrow text-muted">
            Navigation
          </p>
          <div className="flex flex-col gap-3 text-sm uppercase tracking-meta">
            {siteConfig.navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="w-fit transition-colors duration-150 hover:text-accent"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Contact + socials */}
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-eyebrow text-muted">
            Connect
          </p>
          <ContactInfo contact={settings.contact} />
          <div className="flex flex-wrap gap-4 pt-2 text-xs uppercase tracking-ui text-muted">
            {settings.social.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="transition-colors duration-150 hover:text-accent"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="section-shell mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5 text-xs uppercase tracking-ui text-muted">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/impressum"
            className="transition-colors duration-150 hover:text-accent"
          >
            Impressum
          </Link>
          <Link
            href="/datenschutz"
            className="transition-colors duration-150 hover:text-accent"
          >
            Datenschutz
          </Link>
        </div>
        <p className="text-[0.68rem] tracking-[0.22em] text-muted/80">
          Externe Medien laden erst nach Klick
        </p>
      </div>
    </footer>
  );
}
