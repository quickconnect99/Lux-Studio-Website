import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, IBM_Plex_Mono } from "next/font/google";
import Script from "next/script";
import "@/app/globals.css";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { MotionProvider } from "@/components/ui/motion-provider";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { siteConfig } from "@/lib/site-config";
import { getSiteSettings } from "@/lib/supabase";
import { DEFAULT_THEME, themeIds } from "@/lib/themes";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
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
    openGraph: {
      title: settings.seo.title,
      description: settings.seo.description,
      type: "website",
      siteName: settings.brand.name,
      images: [
        {
          url: settings.seo.ogImage,
          alt: `${settings.brand.name} hero still`
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: settings.seo.title,
      description: settings.seo.description,
      images: [settings.seo.ogImage]
    }
  };
}

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  variable: "--font-barlow",
  weight: ["300", "400", "500", "600", "700"]
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
  const settings = await getSiteSettings();

  /** #19 – Schema.org Organisation structured data */
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.brand.name,
    description: settings.brand.strapline,
    url: siteConfig.siteUrl,
    logo: `${siteConfig.siteUrl}/images/hero-poster.svg`,
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
      className={`${barlow.variable} ${mono.variable}`}
      data-theme={DEFAULT_THEME}
      suppressHydrationWarning
    >
      <body className="font-[family:var(--font-sans)] antialiased">
        {/* Anti-FOUC: runs synchronously before any content renders */}
        <script
          dangerouslySetInnerHTML={{
            __html: themeInitScript,
          }}
        />
        {/* Schema.org JSON-LD */}
        <Script
          id="schema-org-organization"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />

        <ThemeProvider>
          <MotionProvider>
            <div className="texture-grid min-h-screen">
              <SiteHeader settings={settings} />
              {children}
              <SiteFooter settings={settings} />
              <ThemeSwitcher />
            </div>
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
