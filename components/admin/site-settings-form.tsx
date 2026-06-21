"use client";

import { SiteSettingsPreview } from "@/components/admin/site-settings-preview";
import type { SiteSettingsEditorProps } from "@/components/admin/site-settings-editor-types";

export function SiteSettingsForm(props: SiteSettingsEditorProps) {
  return <SiteSettingsPreview {...props} />;
}
