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
  aboutTeamGalleryFiles?: File[];
  aboutTeamMemberImageFiles?: Array<{ index: number; file: File }>;
  setSiteHeroVideoFile?: (file: File | null) => void;
  addSelectedFrameFiles?: (files: File[]) => void;
  removeSelectedFrameFile?: (index: number) => void;
  addAboutTeamGalleryFiles?: (files: File[]) => void;
  removeAboutTeamGalleryFile?: (index: number) => void;
  setAboutTeamMemberImageFile?: (index: number, file: File | null) => void;
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
  | "aboutTeamGalleryFiles"
  | "aboutTeamMemberImageFiles"
  | "setSiteHeroVideoFile"
  | "addSelectedFrameFiles"
  | "removeSelectedFrameFile"
  | "addAboutTeamGalleryFiles"
  | "removeAboutTeamGalleryFile"
  | "setAboutTeamMemberImageFile"
  | "handleFileSelection"
>;

export type PreviewPage =
  | "general"
  | "home"
  | "work"
  | "services"
  | "about"
  | "contact";
export type PreviewWidth = "desktop" | "mobile";
