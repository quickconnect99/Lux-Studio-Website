import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Bodoni_Moda, IBM_Plex_Mono } from "next/font/google";
import Script from "next/script";
import "@/app/globals.css";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { adaptSiteSettingsToPublishedProjects } from "@/lib/public-portfolio";
import {
  buildSharingMetadata,
  resolveSharingImage
} from "@/lib/sharing-metadata";
import { siteConfig } from "@/lib/site-config";
import { getPublishedProjects, getSiteSettings } from "@/lib/supabase";
import { DEFAULT_THEME, themeIds } from "@/lib/themes";
import { serializeJsonLd } from "@/lib/json-ld";

// Pages are cached and served statically, refreshed at most every 5 minutes
// on their own — but an admin save triggers an immediate refresh via
// /api/admin/revalidate, so this window is a fallback, not the normal path.
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const [rawSettings, projects] = await Promise.all([
    getSiteSettings(),
    getPublishedProjects()
  ]);
  const settings = adaptSiteSettingsToPublishedProjects(rawSettings, projects);
  const sharingImage = resolveSharingImage({
    preferredImages: settings.selectedFrames,
    projects,
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

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  variable: "--font-barlow",
  weight: ["300", "400", "500", "600", "700"]
});

const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni",
  weight: ["400", "500", "600", "700"]
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"]
});

const themeInitScript = `(function(){try{var allowed=${JSON.stringify(themeIds)};var stored=localStorage.getItem("theme");var theme=allowed.indexOf(stored)!==-1?stored:${JSON.stringify(DEFAULT_THEME)};document.documentElement.setAttribute("data-theme",theme);}catch(e){document.documentElement.setAttribute("data-theme",${JSON.stringify(DEFAULT_THEME)});}})();`;

/** #22 – viewport-fit=cover prevents notch/safe-area clipping on iOS */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [rawSettings, projects] = await Promise.all([
    getSiteSettings(),
    getPublishedProjects()
  ]);
  const settings = adaptSiteSettingsToPublishedProjects(rawSettings, projects);

  /** #19 – Schema.org Organisation structured data */
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.brand.name,
    description: settings.brand.strapline,
    url: siteConfig.siteUrl,
    logo: `${siteConfig.siteUrl}/images/brand/lux-studio-logo.svg`,
    contactPoint: {
      "@type": "ContactPoint",
      email: settings.contact.email,
      telephone: settings.contact.phone,
      contactType: "customer service"
    },
    sameAs: settings.social.map((s) => s.href)
  };

  return (
    <html
      lang="en"
      className={`${barlow.variable} ${bodoniModa.variable} ${mono.variable}`}
      data-theme={DEFAULT_THEME}
      suppressHydrationWarning
    >
      <body className="font-[family-name:var(--font-sans)] antialiased">
        {/* Anti-FOUC: runs synchronously before any content renders */}
        <script
          dangerouslySetInnerHTML={{
            __html: themeInitScript
          }}
        />
        {/* Schema.org JSON-LD */}
        <Script
          id="schema-org-organization"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(organizationSchema)
          }}
        />

        <ThemeProvider>
          <div className="texture-grid min-h-screen">
            <SiteHeader settings={settings} />
            {children}
            <SiteFooter settings={settings} />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
