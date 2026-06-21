import type { SiteCopy } from "@/lib/types";
import type { SiteSettingsFieldsProps } from "@/components/admin/site-settings-editor-types";

export function updateCopySection<K extends keyof SiteCopy>(
  formState: SiteSettingsFieldsProps["formState"],
  updateField: SiteSettingsFieldsProps["updateField"],
  section: K,
  patch: Partial<SiteCopy[K]>
) {
  updateField("copy", {
    ...formState.copy,
    [section]: {
      ...formState.copy[section],
      ...patch
    }
  });
}
