import type { Project, SiteSettings } from "@/lib/types";

export function hasPublishedHospitalityProject(projects: Project[]) {
  return projects.some(
    (project) => project.published && project.business === "Hospitality"
  );
}

/**
 * Public copy is authored explicitly in the CMS. Project availability must not
 * recursively rewrite unrelated brand, legal, contact, or service text.
 */
export function adaptSiteSettingsToPublishedProjects(
  settings: SiteSettings,
  _projects: Project[]
) {
  return settings;
}
