import type { SiteSettingsFormState } from "@/lib/admin-types";

export const SITE_SETTINGS_DRAFT_STORAGE_KEY =
  "lux-admin-site-settings-draft-v1";

export type SiteSettingsDraft = {
  version: 1;
  baseSnapshot: string;
  updatedAt: string;
  formState: SiteSettingsFormState;
  hadPendingFiles: boolean;
};

function isSiteSettingsFormState(
  value: unknown
): value is SiteSettingsFormState {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Partial<SiteSettingsFormState>;

  return (
    typeof candidate.updatedAt === "string" &&
    typeof candidate.brandName === "string" &&
    typeof candidate.contactEmail === "string" &&
    typeof candidate.heroVideoUrl === "string" &&
    typeof candidate.selectedFramesText === "string" &&
    typeof candidate.motionFramesText === "string" &&
    Array.isArray(candidate.socialLinks) &&
    Array.isArray(candidate.aboutValues) &&
    Array.isArray(candidate.services) &&
    Array.isArray(candidate.aboutTeamMembers) &&
    Boolean(candidate.copy && typeof candidate.copy === "object")
  );
}

/**
 * Parses a Site Settings recovery draft only when its schema and clean base
 * snapshot still match the currently loaded settings.
 */
export function parseSiteSettingsDraft(
  value: string | null,
  baseSnapshot: string
): SiteSettingsDraft | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<SiteSettingsDraft>;

    if (
      parsed.version !== 1 ||
      parsed.baseSnapshot !== baseSnapshot ||
      typeof parsed.updatedAt !== "string" ||
      typeof parsed.hadPendingFiles !== "boolean" ||
      !isSiteSettingsFormState(parsed.formState)
    ) {
      return null;
    }

    return parsed as SiteSettingsDraft;
  } catch {
    return null;
  }
}

/** Reads and validates the current browser's Site Settings recovery draft. */
export function readSiteSettingsDraft(baseSnapshot: string) {
  if (typeof window === "undefined") return null;

  try {
    return parseSiteSettingsDraft(
      window.localStorage.getItem(SITE_SETTINGS_DRAFT_STORAGE_KEY),
      baseSnapshot
    );
  } catch {
    return null;
  }
}

/**
 * Stores text-based Site Settings recovery data in `localStorage`.
 *
 * Pending `File` objects cannot be serialized; `hadPendingFiles` lets the UI
 * explain that those files must be selected again after a reload.
 */
export function persistSiteSettingsDraft(
  draft: Omit<SiteSettingsDraft, "version" | "updatedAt">
) {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.setItem(
      SITE_SETTINGS_DRAFT_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        updatedAt: new Date().toISOString(),
        ...draft
      } satisfies SiteSettingsDraft)
    );
    return true;
  } catch {
    return false;
  }
}

/** Removes the Site Settings recovery draft after save or explicit reset. */
export function clearSiteSettingsDraft() {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.removeItem(SITE_SETTINGS_DRAFT_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
