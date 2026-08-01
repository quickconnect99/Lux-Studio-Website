import {
  buildProjectDatabasePayload,
  buildSiteSettingsDatabasePayload,
  getProjectMediaState
} from "@/lib/admin-persistence";
import type {
  ProjectFormState,
  SiteSettingsFormState
} from "@/lib/admin-types";

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
 * The database payload already normalizes structured arrays and omits
 * `updatedAt`. Comparing it directly is important for incomplete editor rows:
 * public display normalization intentionally hides a team member without a
 * portrait, but the admin must still treat that newly added row as unsaved.
 */
export function serializeSiteSettingsFormState(
  formState: SiteSettingsFormState
) {
  return JSON.stringify(buildSiteSettingsDatabasePayload(formState));
}
