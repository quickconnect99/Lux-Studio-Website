import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { NotFoundContent } from "@/components/sections/not-found-content";
import { adaptSiteSettingsToPublishedProjects } from "@/lib/public-portfolio";
import { getPublishedProjects, getSiteSettings } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Page Not Found | Lux Studio",
  description: "The requested Lux Studio page could not be found."
};

export default async function NotFound() {
  const [rawSettings, projects] = await Promise.all([
    getSiteSettings(),
    getPublishedProjects()
  ]);
  const settings = adaptSiteSettingsToPublishedProjects(rawSettings, projects);

  return (
    <div className="texture-grid min-h-screen">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-foreground px-5 py-3 text-xs font-medium uppercase tracking-ui text-background shadow-card transition-transform focus-visible:translate-y-0"
      >
        Skip to content
      </a>
      <SiteHeader settings={settings} />
      <main id="main-content" tabIndex={-1}>
        <NotFoundContent />
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
