import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatProjectLabel(value: string) {
  return value.toUpperCase().replace(/\s+/g, " / ");
}

export function parseSearchParam(
  value?: string | string[] | null
): string | null {
  const candidate = Array.isArray(value) ? value[0] : value;

  if (!candidate) {
    return null;
  }

  try {
    return decodeURIComponent(candidate).trim() || null;
  } catch {
    return null;
  }
}
