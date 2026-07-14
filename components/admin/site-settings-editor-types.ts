import type { ChangeEvent } from "react";
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
  siteHeroVideoFile?: File | null;
  selectedFrameFiles?: File[];
  aboutTeamImageFiles?: File[];
  setSiteHeroVideoFile?: (file: File | null) => void;
  addSelectedFrameFiles?: (files: File[]) => void;
  removeSelectedFrameFile?: (index: number) => void;
  addAboutTeamImageFiles?: (files: File[]) => void;
  removeAboutTeamImageFile?: (index: number) => void;
  handleFileSelection?: (
    event: ChangeEvent<HTMLInputElement>,
    type: "cover" | "video" | "siteHeroVideo"
  ) => void;
};

export type SiteSettingsFieldsProps = Pick<
  SiteSettingsEditorProps,
  | "formState"
  | "updateField"
  | "siteHeroVideoFile"
  | "selectedFrameFiles"
  | "aboutTeamImageFiles"
  | "setSiteHeroVideoFile"
  | "addSelectedFrameFiles"
  | "removeSelectedFrameFile"
  | "addAboutTeamImageFiles"
  | "removeAboutTeamImageFile"
  | "handleFileSelection"
>;

export type PreviewPage = "home" | "work" | "services" | "about" | "contact";
export type PreviewWidth = "desktop" | "mobile";
