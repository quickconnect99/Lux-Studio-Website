import type { ProjectBusiness } from "@/lib/types";

export const projectBusinesses: ProjectBusiness[] = [
  "Automotive",
  "Hospitality",
  "Architecture",
  "Lifestyle",
  "Event",
  "Brand"
];

export function normalizeProjectBusiness(
  value?: string | null
): ProjectBusiness {
  const normalized = value?.trim();

  if (!normalized) {
    return "Automotive";
  }

  return normalized.toLowerCase() === "car" ? "Automotive" : normalized;
}

export function parseProjectBusinessParam(
  value?: string | string[] | null
): ProjectBusiness | null {
  const candidate = Array.isArray(value) ? value[0] : value;

  if (!candidate) {
    return null;
  }

  return decodeURIComponent(candidate).trim() || null;
}

export function projectBusinessToParam(business: ProjectBusiness): string {
  return encodeURIComponent(business.trim().toLowerCase());
}

export function getProjectPrimaryMetaLabel(_business: ProjectBusiness): string {
  return "Category";
}

export function getProjectPrimaryMetaPlaceholder(
  _business: ProjectBusiness
): string {
  return "Launch film, brand campaign, opening night...";
}
