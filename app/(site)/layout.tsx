import type { Metadata } from "next";
import Script from "next/script";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { MotionProvider } from "@/components/ui/motion-provider";
import { serializeJsonLd } from "@/lib/json-ld";
import {
  buildSharingMetadata,
  resolveSharingImage
} from "@/lib/sharing-metadata";
import { siteConfig } from "@/lib/site-config";
import { getSiteSettings } from "@/lib/supabase";
import { buildOrganizationSchema } from "@/lib/site-structured-data";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const sharingImage = resolveSharingImage({
    preferredImages: settings.selectedFrames,
    settings
  });

  return {
    metadataBase: new URL(siteConfig.siteUrl),
    title: {
      default: settings.seo.title,
      template: `%s | ${settings.brand.name}`
    },
    description: settings.seo.description,
    alternates: {
      canonical: "/"
    },
    ...buildSharingMetadata({
      title: settings.seo.title,
      description: settings.seo.description,
      siteName: settings.brand.name,
      image: sharingImage,
      imageAlt: `${settings.brand.name} featured still`
    })
  };
}

export default async function PublicSiteLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  const organizationSchema = buildOrganizationSchema(settings);

  return (
    <MotionProvider>
      <div className="texture-grid min-h-screen">
        <Script
          id="schema-org-organization"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(organizationSchema)
          }}
        />
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-foreground px-5 py-3 text-xs font-medium uppercase tracking-ui text-background shadow-card transition-transform focus-visible:translate-y-0"
        >
          Skip to content
        </a>
        <SiteHeader settings={settings} />
        {children}
        <SiteFooter settings={settings} />
      </div>
    </MotionProvider>
  );
}
