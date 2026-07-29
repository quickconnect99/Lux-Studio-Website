import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { getPublishedProjects, getSiteSettings } from "@/lib/supabase";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.siteUrl;
  const [projects, settings] = await Promise.all([
    getPublishedProjects(),
    getSiteSettings()
  ]);
  const routes: Array<{
    path: string;
    changeFrequency: "weekly" | "monthly" | "yearly";
    priority: number;
  }> = [
    { path: "", changeFrequency: "weekly", priority: 1 },
    { path: "/work", changeFrequency: "weekly", priority: 0.9 },
    { path: "/services", changeFrequency: "monthly", priority: 0.7 },
    { path: "/about", changeFrequency: "monthly", priority: 0.6 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
    { path: "/impressum", changeFrequency: "yearly", priority: 0.2 },
    { path: "/datenschutz", changeFrequency: "yearly", priority: 0.2 }
  ];

  return [
    ...routes.map((route) => ({
      url: `${baseUrl}${route.path}`,
      lastModified: new Date(settings.updatedAt),
      changeFrequency: route.changeFrequency,
      priority: route.priority
    })),
    ...projects.map((project) => ({
      url: `${baseUrl}/work/${project.slug}`,
      lastModified: new Date(project.updatedAt ?? project.createdAt),
      changeFrequency: "monthly" as const,
      priority: 0.8
    }))
  ];
}
