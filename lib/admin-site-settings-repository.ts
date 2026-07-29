import type { SupabaseClient } from "@supabase/supabase-js";
import type { buildSiteSettingsDatabasePayload } from "@/lib/admin-persistence";
import { resolveAdminMutationResult } from "@/lib/admin-optimistic-mutation";
import type { AdminResult } from "@/lib/admin-result";
import type { normalizeSiteSettingsRecord } from "@/lib/supabase";

type SiteSettingsDatabasePayload = ReturnType<
  typeof buildSiteSettingsDatabasePayload
>;
type SiteSettingsDatabaseRow = Parameters<
  typeof normalizeSiteSettingsRecord
>[0];

/**
 * Inserts or updates the singleton Site Settings record.
 *
 * Updates can include `expectedUpdatedAt` to detect edits made in another
 * browser tab. The raw row is returned so the caller can normalize the exact
 * database-confirmed state before replacing its clean snapshot.
 */
export async function saveAdminSiteSettingsRecord(
  supabase: SupabaseClient,
  payload: SiteSettingsDatabasePayload,
  options: {
    recordExists: boolean;
    expectedUpdatedAt?: string;
  }
): Promise<AdminResult<SiteSettingsDatabaseRow>> {
  const { id, ...changes } = payload;
  const result = options.recordExists
    ? await (() => {
        let query = supabase.from("site_settings").update(changes).eq("id", id);

        if (options.expectedUpdatedAt) {
          query = query.eq("updated_at", options.expectedUpdatedAt);
        }

        return query.select("*").maybeSingle();
      })()
    : await supabase
        .from("site_settings")
        .insert({ id, ...changes })
        .select("*")
        .single();

  return resolveAdminMutationResult(result, {
    operationFallback: "The site settings could not be saved.",
    staleMessage:
      "The site settings were changed in another browser tab. Reload them before saving so those changes are not overwritten.",
    mapData: (data) => data as SiteSettingsDatabaseRow
  });
}
