import type { ProjectBusiness } from "@/lib/types";

export const projectBusinesses: ProjectBusiness[] = ["Car", "Hospitality"];

export function normalizeProjectBusiness(
  value?: string | null
): ProjectBusiness {
  return value?.trim().toLowerCase() === "hospitality" ? "Hospitality" : "Car";
}

export function parseProjectBusinessParam(
  value?: string | string[] | null
): ProjectBusiness | null {
  const candidate = Array.isArray(value) ? value[0] : value;

  if (!candidate) {
    return null;
  }

  const normalized = candidate.trim().toLowerCase();

  if (normalized === "car") {
    return "Car";
  }

  if (normalized === "hospitality") {
    return "Hospitality";
  }

  return null;
}

export function projectBusinessToParam(business: ProjectBusiness): string {
  return business.toLowerCase();
}

export function getProjectPrimaryMetaLabel(business: ProjectBusiness): string {
  return business === "Hospitality" ? "Property" : "Model";
}

export function getProjectPrimaryMetaPlaceholder(
  business: ProjectBusiness
): string {
  return business === "Hospitality" ? "7132 Hotel" : "BMW M4 Competition";
}
