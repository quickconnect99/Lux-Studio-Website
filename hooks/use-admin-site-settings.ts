"use client";

import { useCallback, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useForm } from "@/hooks/use-form";
import { buildSiteSettingsDatabasePayload } from "@/lib/admin-persistence";
import { toAdminOperationError } from "@/lib/admin-result";
import {
  revalidateAdminPublicContent,
  uploadAdminFile
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
import {
  SITE_SETTINGS_ID,
  normalizeSiteSettingsRecord
} from "@/lib/supabase";

type TeamImageFile = {
  index: number;
  file: File;
};

type UseAdminSiteSettingsOptions = {
  supabase: SupabaseClient | null;
  sessionEmail: string | null;
  siteHeroVideoFile: File | null;
  selectedFrameFiles: File[];
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
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    serializeSiteSettingsFormState(
      toSiteSettingsFormState(defaultSiteSettings)
    )
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
    setSavedSnapshot(serializeSiteSettingsFormState(state));
  }, [replaceForm, showStatus, supabase]);

  const save = useCallback(
    async (event: { preventDefault(): void }) => {
      event.preventDefault();
      setSaveReport(null);
      setWorking(true);

      try {
        if (!supabase) {
          showStatus(
            "Connect Supabase to persist global links and contact details. Static fallback still lives in lib/site-config.ts."
          );
          return;
        }

        if (!sessionEmail) {
          showStatus("Sign in to save global site settings.");
          return;
        }

        let heroVideoUrl = formState.heroVideoUrl;
        let selectedFrames = parseMultilineInput(
          formState.selectedFramesText
        );
        const aboutTeamMembers = [...formState.aboutTeamMembers];
        const totalFiles =
          (siteHeroVideoFile ? 1 : 0) +
          selectedFrameFiles.length +
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
        }

        if (selectedFrameFiles.length > 0) {
          const uploadedFrames: string[] = [];

          for (const file of selectedFrameFiles) {
            setUploadProgress({
              current: ++uploadedCount,
              total: totalFiles,
              filename: file.name
            });
            uploadedFrames.push(
              await uploadAdminFile(supabase, file, "selected-frames")
            );
          }

          selectedFrames = [...selectedFrames, ...uploadedFrames];
        }

        if (aboutTeamMemberImageFiles.length > 0) {
          for (const item of aboutTeamMemberImageFiles) {
            setUploadProgress({
              current: ++uploadedCount,
              total: totalFiles,
              filename: item.file.name
            });
            aboutTeamMembers[item.index] = {
              ...aboutTeamMembers[item.index],
              image: await uploadAdminFile(
                supabase,
                item.file,
                "about-team"
              )
            };
          }
        }

        setUploadProgress(null);

        const nextFormState: SiteSettingsFormState = {
          ...formState,
          heroVideoUrl,
          selectedFramesText: selectedFrames.join("\n"),
          aboutTeamImagesText: aboutTeamMembers
            .map((member) => member.image)
            .filter(Boolean)
            .join("\n"),
          aboutTeamMembers
        };
        const payload = buildSiteSettingsDatabasePayload(nextFormState);
        const { data, error } = await supabase
          .from("site_settings")
          .upsert(payload, { onConflict: "id" })
          .select("*")
          .single();

        if (error) {
          showStatus(
            toAdminOperationError(
              error,
              "The site settings could not be saved."
            ).message
          );
          return;
        }

        const savedState = toSiteSettingsFormState(
          normalizeSiteSettingsRecord(data)
        );
        replaceForm(savedState);
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
              : [])
          ]
        });
      } catch (error) {
        setUploadProgress(null);
        showStatus(
          toAdminOperationError(
            error,
            "The site settings could not be saved."
          ).message
        );
      } finally {
        setWorking(false);
      }
    },
    [
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

  return {
    formState,
    isDirty,
    load,
    save,
    updateField
  };
}
