import type { Project, SiteSettings } from "@/lib/types";

const automotiveOnlyReplacements: Array<[RegExp, string]> = [
  [
    /\bpremium automotive\s*(?:&|and)\s*hospitality campaigns\b/gi,
    "Premium Automotive Campaigns"
  ],
  [
    /\bautomotive brands,\s*hotels,\s*and hospitality spaces\b/gi,
    "automotive brands and premium products"
  ],
  [
    /\blaunches,\s*properties,\s*and premium brand content\b/gi,
    "launches and premium brand content"
  ],
  [
    /\bproperty content,\s*social cutdowns,\s*guest-experience edits\b/gi,
    "campaign content, social cutdowns, audience-focused edits"
  ],
  [/\bautomotive\s*(?:&|and)\s*hospitality\b/gi, "automotive"],
  [/\bhospitality\s*(?:&|and)\s*automotive\b/gi, "automotive"],
  [/\bhospitality brands?\b/gi, "automotive brands"],
  [/\bhospitality projects?\b/gi, "campaign projects"],
  [/\bhospitality spaces?\b/gi, "automotive brands"],
  [/\bhotels?\b/gi, "automotive brands"],
  [/\bproperties\b/gi, "campaigns"],
  [/\bproperty\b/gi, "campaign"],
  [/\bguest-experience\b/gi, "audience-focused"],
  [/\bhospitality\b/gi, "automotive"],
  [/\bbrands and places\b/gi, "automotive brands"],
  [/\bbrands and spaces\b/gi, "automotive brands"],
  [/\bpremium spaces\b/gi, "premium vehicles"],
  [/\bcars, spaces, arrivals\b/gi, "cars, products, arrivals"]
];

export function hasPublishedHospitalityProject(projects: Project[]) {
  return projects.some(
    (project) => project.published && project.business === "Hospitality"
  );
}

export function removeHospitalityReferences(value: string) {
  return automotiveOnlyReplacements
    .reduce(
    (result, [pattern, replacement]) => result.replace(pattern, replacement),
    value
    )
    .replace(
      /\bautomotive brands(?:,\s*automotive brands)+(?:,\s*and automotive brands)?\b/gi,
      "automotive brands"
    );
}

function sanitizeValue<T>(value: T): T {
  if (typeof value === "string") {
    return removeHospitalityReferences(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, sanitizeValue(item)])
    ) as T;
  }

  return value;
}

export function adaptSiteSettingsToPublishedProjects(
  settings: SiteSettings,
  projects: Project[]
) {
  if (hasPublishedHospitalityProject(projects)) {
    return settings;
  }

  return sanitizeValue(settings);
}
