"use client";

import { useCallback, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useForm } from "@/hooks/use-form";
import { buildSiteSettingsDatabasePayload } from "@/lib/admin-persistence";
import { toAdminOperationError } from "@/lib/admin-result";
import {
  removeAdminFiles,
  removeUnreferencedAdminFiles,
  revalidateAdminPublicContent,
  uploadAdminFile,
  uploadAdminFiles
} from "@/lib/admin-storage";
import type {
  AdminSaveReport,
  AdminUploadProgress,
  SiteSettingsFormState
} from "@/lib/admin-types";
import {
  parseMultilineInput,
  toSiteSettingsFormState
} from "@/lib/admin-utils";
import { defaultSiteSettings } from "@/lib/site-config";
import { SITE_SETTINGS_ID, normalizeSiteSettingsRecord } from "@/lib/supabase";
import { buildFrameItems } from "@/lib/project-images";

type TeamImageFile = {
  index: number;
  file: File;
};

type UseAdminSiteSettingsOptions = {
  supabase: SupabaseClient | null;
  sessionEmail: string | null;
  siteHeroVideoFile: File | null;
  selectedFrameFiles: File[];
  aboutTeamGalleryFiles: File[];
  aboutTeamMemberImageFiles: TeamImageFile[];
  clearSiteSettingsMedia(): void;
  setSaveReport(report: AdminSaveReport | null): void;
  setUploadProgress(progress: AdminUploadProgress | null): void;
  setWorking(working: boolean): void;
  showStatus(message: string): void;
};

export function serializeSiteSettingsFormState(
  formState: SiteSettingsFormState
) {
  return JSON.stringify(
    toSiteSettingsFormState(
      normalizeSiteSettingsRecord(buildSiteSettingsDatabasePayload(formState))
    )
  );
}

export function useAdminSiteSettings({
  supabase,
  sessionEmail,
  siteHeroVideoFile,
  selectedFrameFiles,
  aboutTeamGalleryFiles,
  aboutTeamMemberImageFiles,
  clearSiteSettingsMedia,
  setSaveReport,
  setUploadProgress,
  setWorking,
  showStatus
}: UseAdminSiteSettingsOptions) {
  const form = useForm<SiteSettingsFormState>(
    toSiteSettingsFormState(defaultSiteSettings)
  );
  const savedFormStateRef = useRef(
    toSiteSettingsFormState(defaultSiteSettings)
  );
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    serializeSiteSettingsFormState(toSiteSettingsFormState(defaultSiteSettings))
  );

  const {
    values: formState,
    replace: replaceForm,
    updateField: updateFormField
  } = form;

  const isDirty =
    serializeSiteSettingsFormState(formState) !== savedSnapshot ||
    Boolean(siteHeroVideoFile) ||
    selectedFrameFiles.length > 0 ||
    aboutTeamGalleryFiles.length > 0 ||
    aboutTeamMemberImageFiles.length > 0;

  const updateField = useCallback(
    <K extends keyof SiteSettingsFormState>(
      key: K,
      value: SiteSettingsFormState[K]
    ) => {
      setSaveReport(null);
      updateFormField(key, value);
    },
    [setSaveReport, updateFormField]
  );

  const load = useCallback(async () => {
    if (!supabase) {
      const state = toSiteSettingsFormState(defaultSiteSettings);
      replaceForm(state);
      setSavedSnapshot(serializeSiteSettingsFormState(state));
      return;
    }

    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", SITE_SETTINGS_ID)
      .maybeSingle();

    if (error) {
      showStatus(
        toAdminOperationError(
          error,
          "Global site settings could not be loaded."
        ).message
      );
      return;
    }

    const state = data
      ? toSiteSettingsFormState(normalizeSiteSettingsRecord(data))
      : toSiteSettingsFormState(defaultSiteSettings);

    replaceForm(state);
    savedFormStateRef.current = state;
    setSavedSnapshot(serializeSiteSettingsFormState(state));
  }, [replaceForm, showStatus, supabase]);

  const save = useCallback(
    async (event?: { preventDefault(): void }): Promise<boolean> => {
      event?.preventDefault();
      setSaveReport(null);
      setWorking(true);
      const newlyUploadedUrls: string[] = [];

      try {
        if (!supabase) {
          showStatus(
            "Connect Supabase to persist global links and contact details. Static fallback still lives in lib/site-config.ts."
          );
          return false;
        }

        if (!sessionEmail) {
          showStatus("Sign in to save global site settings.");
          return false;
        }

        let heroVideoUrl = formState.heroVideoUrl;
        let selectedFrames = parseMultilineInput(formState.selectedFramesText);
        let aboutTeamGallery = parseMultilineInput(
          formState.aboutTeamGalleryText
        );
        const aboutTeamMembers = [...formState.aboutTeamMembers];
        const previousMediaUrls = [
          formState.heroVideoUrl,
          ...buildFrameItems({
            selectedFrames,
            fallbackImages: [],
            galleryImages: []
          }).map((frame) => frame.image),
          ...aboutTeamGallery,
          ...formState.aboutTeamMembers.map((member) => member.image)
        ].filter(Boolean);
        const totalFiles =
          (siteHeroVideoFile ? 1 : 0) +
          selectedFrameFiles.length +
          aboutTeamGalleryFiles.length +
          aboutTeamMemberImageFiles.length;
        let uploadedCount = 0;

        if (siteHeroVideoFile) {
          setUploadProgress({
            current: ++uploadedCount,
            total: totalFiles,
            filename: siteHeroVideoFile.name
          });
          heroVideoUrl = await uploadAdminFile(
            supabase,
            siteHeroVideoFile,
            "videos"
          );
          newlyUploadedUrls.push(heroVideoUrl);
        }

        if (selectedFrameFiles.length > 0) {
          const progressOffset = uploadedCount;
          const uploadedFrames = await uploadAdminFiles(
            supabase,
            selectedFrameFiles,
            "selected-frames",
            (completed, file, publicUrl) => {
              uploadedCount = progressOffset + completed;
              newlyUploadedUrls.push(publicUrl);
              setUploadProgress({
                current: uploadedCount,
                total: totalFiles,
                filename: file.name
              });
            }
          );

          selectedFrames = [...selectedFrames, ...uploadedFrames];
        }

        if (aboutTeamGalleryFiles.length > 0) {
          const progressOffset = uploadedCount;
          const uploadedTeamGallery = await uploadAdminFiles(
            supabase,
            aboutTeamGalleryFiles,
            "about-team-gallery",
            (completed, file, publicUrl) => {
              uploadedCount = progressOffset + completed;
              newlyUploadedUrls.push(publicUrl);
              setUploadProgress({
                current: uploadedCount,
                total: totalFiles,
                filename: file.name
              });
            }
          );

          aboutTeamGallery = [...aboutTeamGallery, ...uploadedTeamGallery];
        }

        if (aboutTeamMemberImageFiles.length > 0) {
          const progressOffset = uploadedCount;
          const uploadedTeamImages = await uploadAdminFiles(
            supabase,
            aboutTeamMemberImageFiles.map((item) => item.file),
            "about-team",
            (completed, file, publicUrl) => {
              uploadedCount = progressOffset + completed;
              newlyUploadedUrls.push(publicUrl);
              setUploadProgress({
                current: uploadedCount,
                total: totalFiles,
                filename: file.name
              });
            }
          );

          uploadedTeamImages.forEach((image, fileIndex) => {
            const item = aboutTeamMemberImageFiles[fileIndex];
            aboutTeamMembers[item.index] = {
              ...aboutTeamMembers[item.index],
              image
            };
          });
        }

        setUploadProgress(null);

        const nextFormState: SiteSettingsFormState = {
          ...formState,
          heroVideoUrl,
          selectedFramesText: selectedFrames.join("\n"),
          aboutTeamGalleryText: aboutTeamGallery.join("\n"),
          aboutTeamMembers
        };
        const payload = buildSiteSettingsDatabasePayload(nextFormState);
        const { data, error } = await supabase
          .from("site_settings")
          .upsert(payload, { onConflict: "id" })
          .select("*")
          .single();

        if (error) {
          await removeAdminFiles(supabase, newlyUploadedUrls);
          showStatus(
            toAdminOperationError(
              error,
              "The site settings could not be saved."
            ).message
          );
          return false;
        }

        const savedState = toSiteSettingsFormState(
          normalizeSiteSettingsRecord(data)
        );
        const currentMediaUrls = [
          heroVideoUrl,
          ...buildFrameItems({
            selectedFrames,
            fallbackImages: [],
            galleryImages: []
          }).map((frame) => frame.image),
          ...aboutTeamGallery,
          ...aboutTeamMembers.map((member) => member.image)
        ].filter(Boolean);
        const replacedMediaUrls = previousMediaUrls.filter(
          (url) => !currentMediaUrls.includes(url)
        );
        void removeUnreferencedAdminFiles(supabase, replacedMediaUrls);
        replaceForm(savedState);
        savedFormStateRef.current = savedState;
        setSavedSnapshot(serializeSiteSettingsFormState(savedState));
        clearSiteSettingsMedia();
        showStatus("Global site settings saved to Supabase.");
        void revalidateAdminPublicContent(supabase);
        setSaveReport({
          title: "Site settings saved",
          items: [
            {
              id: "site-settings",
              label: "Global site settings saved",
              detail: "Supabase",
              tone: "success"
            },
            ...(siteHeroVideoFile
              ? [
                  {
                    id: "hero-video",
                    label: "Hero reel uploaded",
                    detail: siteHeroVideoFile.name,
                    tone: "success" as const
                  }
                ]
              : []),
            ...(selectedFrameFiles.length > 0
              ? [
                  {
                    id: "selected-frames",
                    label: `${selectedFrameFiles.length} selected frame${
                      selectedFrameFiles.length === 1 ? "" : "s"
                    } uploaded`,
                    detail: "Selected frames",
                    tone: "success" as const
                  }
                ]
              : []),
            ...(aboutTeamMemberImageFiles.length > 0
              ? [
                  {
                    id: "about-team-member-images",
                    label: `${aboutTeamMemberImageFiles.length} team portrait${
                      aboutTeamMemberImageFiles.length === 1 ? "" : "s"
                    } uploaded`,
                    detail: "About team",
                    tone: "success" as const
                  }
                ]
              : []),
            ...(aboutTeamGalleryFiles.length > 0
              ? [
                  {
                    id: "about-team-gallery",
                    label: `${aboutTeamGalleryFiles.length} team gallery image${
                      aboutTeamGalleryFiles.length === 1 ? "" : "s"
                    } uploaded`,
                    detail: "About team gallery",
                    tone: "success" as const
                  }
                ]
              : [])
          ]
        });
        return true;
      } catch (error) {
        setUploadProgress(null);
        if (supabase && newlyUploadedUrls.length > 0) {
          await removeAdminFiles(supabase, newlyUploadedUrls);
        }
        showStatus(
          toAdminOperationError(error, "The site settings could not be saved.")
            .message
        );
        return false;
      } finally {
        setWorking(false);
      }
    },
    [
      aboutTeamGalleryFiles,
      aboutTeamMemberImageFiles,
      clearSiteSettingsMedia,
      formState,
      replaceForm,
      selectedFrameFiles,
      sessionEmail,
      setSaveReport,
      setUploadProgress,
      setWorking,
      showStatus,
      siteHeroVideoFile,
      supabase
    ]
  );

  const reset = useCallback(() => {
    replaceForm(savedFormStateRef.current);
    clearSiteSettingsMedia();
    setSaveReport(null);
    showStatus("Site settings restored to the last saved state.");
  }, [
    clearSiteSettingsMedia,
    replaceForm,
    setSaveReport,
    showStatus
  ]);

  return {
    formState,
    isDirty,
    load,
    save,
    reset,
    updateField
  };
}
