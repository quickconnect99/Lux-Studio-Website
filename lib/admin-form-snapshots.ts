import {
  buildProjectDatabasePayload,
  buildSiteSettingsDatabasePayload,
  getProjectMediaState
} from "@/lib/admin-persistence";
import type {
  ProjectFormState,
  SiteSettingsFormState
} from "@/lib/admin-types";
import { toSiteSettingsFormState } from "@/lib/admin-utils";
import { normalizeSiteSettingsRecord } from "@/lib/supabase";

/**
 * Creates the canonical project comparison string used by Dirty State checks.
 *
 * Serializing the same normalized payload that would be saved avoids reporting
 * harmless formatting differences as unsaved changes.
 */
export function serializeProjectFormState(formState: ProjectFormState) {
  const payload = buildProjectDatabasePayload({
    formState,
    slug: formState.slug,
    media: getProjectMediaState(formState),
    createdAt: formState.createdAt
  });

  return JSON.stringify(payload);
}

/**
 * Creates a canonical Site Settings comparison string.
 *
 * The value is round-tripped through database normalization, and `updatedAt`
 * is omitted because a server timestamp is not an editor change.
 */
export function serializeSiteSettingsFormState(
  formState: SiteSettingsFormState
) {
  const normalized = toSiteSettingsFormState(
    normalizeSiteSettingsRecord(buildSiteSettingsDatabasePayload(formState))
  );

  return JSON.stringify({ ...normalized, updatedAt: undefined });
}
