"use client";

import { SiteSettingsPreview } from "@/components/admin/site-settings-preview";
import type { SiteSettingsEditorProps } from "@/components/admin/site-settings-editor-types";

/**
 * Connects the Site Settings inspector with its page previews.
 *
 * All values and mutation callbacks are supplied by the admin hooks. This
 * component remains a render boundary and contains no Supabase persistence.
 */
export function SiteSettingsForm(props: SiteSettingsEditorProps) {
  return <SiteSettingsPreview {...props} />;
}
