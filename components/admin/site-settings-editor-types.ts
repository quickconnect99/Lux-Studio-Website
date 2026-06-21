import type { SiteSettingsFormState } from "@/lib/admin-types";

export type SiteSettingsEditorProps = {
  formState: SiteSettingsFormState;
  isDirty?: boolean;
  updateField: <K extends keyof SiteSettingsFormState>(
    key: K,
    value: SiteSettingsFormState[K]
  ) => void;
  onSubmit: (event: { preventDefault(): void }) => void;
  working: boolean;
};

export type SiteSettingsFieldsProps = Pick<
  SiteSettingsEditorProps,
  "formState" | "updateField"
>;

export type PreviewPage = "home" | "services" | "about" | "contact";
export type PreviewWidth = "desktop" | "mobile";
