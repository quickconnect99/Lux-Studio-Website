import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { adaptSiteSettingsToPublishedProjects } from "@/lib/public-portfolio";
import { getPublishedProjects, getSiteSettings } from "@/lib/supabase";

export default async function PublicSiteLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [rawSettings, projects] = await Promise.all([
    getSiteSettings(),
    getPublishedProjects()
  ]);
  const settings = adaptSiteSettingsToPublishedProjects(rawSettings, projects);

  return (
    <div className="texture-grid min-h-screen">
      <SiteHeader settings={settings} />
      {children}
      <SiteFooter settings={settings} />
    </div>
  );
}
