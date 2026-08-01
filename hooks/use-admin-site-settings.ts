"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useForm } from "@/hooks/use-form";
import {
  buildSiteSettingsDatabasePayload,
  findIncompleteTeamMember
} from "@/lib/admin-persistence";
import { serializeSiteSettingsFormState } from "@/lib/admin-form-snapshots";
import { buildSiteSettingsSaveReport } from "@/lib/admin-save-report";
import { toAdminOperationError } from "@/lib/admin-result";
import {
  clearSiteSettingsDraft,
  persistSiteSettingsDraft,
  readSiteSettingsDraft
} from "@/lib/admin-site-settings-draft";
import { saveAdminSiteSettingsRecord } from "@/lib/admin-site-settings-repository";
import {
  createAdminUploadSession,
  removeAdminFiles,
  removeUnreferencedAdminFiles,
  revalidateAdminPublicContent
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

const DRAFT_PERSIST_DELAY_MS = 250;

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
  tryStartWorking(): boolean;
  finishWorking(): void;
  showStatus(message: string): void;
};

/**
 * Manages loading, editing, draft recovery, and saving of global Site Settings.
 *
 * Text values live in `SiteSettingsFormState`; newly selected media remains in
 * separate `File` queues until `save` uploads it. A successful save replaces
 * the clean snapshot, removes only media that is no longer referenced, clears
 * the recovery draft, and requests public cache revalidation.
 *
 * @param options - Supabase access, pending media, and shared admin status
 * callbacks.
 * @returns The form state, dirty flag, and load/save/reset/update operations.
 */
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
  tryStartWorking,
  finishWorking,
  showStatus
}: UseAdminSiteSettingsOptions) {
  const form = useForm<SiteSettingsFormState>(
    toSiteSettingsFormState(defaultSiteSettings)
  );
  const savedFormStateRef = useRef(
    toSiteSettingsFormState(defaultSiteSettings)
  );
  const hasPersistedSettingsRef = useRef(false);
  const [hasLoaded, setHasLoaded] = useState(false);
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
  const hasPendingFiles =
    Boolean(siteHeroVideoFile) ||
    selectedFrameFiles.length > 0 ||
    aboutTeamGalleryFiles.length > 0 ||
    aboutTeamMemberImageFiles.length > 0;

  useEffect(() => {
    if (!hasLoaded) return;

    const currentSnapshot = serializeSiteSettingsFormState(formState);
    if (currentSnapshot === savedSnapshot) {
      clearSiteSettingsDraft();
      return;
    }

    const timeout = window.setTimeout(() => {
      persistSiteSettingsDraft({
        baseSnapshot: savedSnapshot,
        formState,
        hadPendingFiles: hasPendingFiles
      });
    }, DRAFT_PERSIST_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [formState, hasLoaded, hasPendingFiles, savedSnapshot]);

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
      const baseSnapshot = serializeSiteSettingsFormState(state);
      const draft = readSiteSettingsDraft(baseSnapshot);
      replaceForm(draft?.formState ?? state);
      savedFormStateRef.current = state;
      hasPersistedSettingsRef.current = false;
      setSavedSnapshot(baseSnapshot);
      setHasLoaded(true);
      if (draft) {
        showStatus("Unsaved site settings draft restored.");
      }
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
    const baseSnapshot = serializeSiteSettingsFormState(state);
    const draft = readSiteSettingsDraft(baseSnapshot);

    replaceForm(draft?.formState ?? state);
    savedFormStateRef.current = state;
    hasPersistedSettingsRef.current = Boolean(data);
    setSavedSnapshot(baseSnapshot);
    setHasLoaded(true);
    if (draft) {
      showStatus(
        draft.hadPendingFiles
          ? "Unsaved site settings draft restored. Local media files must be selected again."
          : "Unsaved site settings draft restored."
      );
    }
  }, [replaceForm, showStatus, supabase]);

  const save = useCallback(
    async (event?: { preventDefault(): void }): Promise<boolean> => {
      event?.preventDefault();

      if (!tryStartWorking()) {
        return false;
      }

      setSaveReport(null);
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

        const incompleteTeamMember = findIncompleteTeamMember(
          formState.aboutTeamMembers,
          aboutTeamMemberImageFiles.map((item) => item.index)
        );

        if (incompleteTeamMember) {
          const missingFields = incompleteTeamMember.missing.join(" and ");
          showStatus(
            `Complete team member ${incompleteTeamMember.index + 1}: add a ${missingFields}.`
          );
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
        const uploads = createAdminUploadSession({
          supabase,
          totalFiles,
          onProgress: setUploadProgress,
          onUploaded: (publicUrl) => newlyUploadedUrls.push(publicUrl)
        });

        if (siteHeroVideoFile) {
          heroVideoUrl = await uploads.uploadFile(siteHeroVideoFile, "videos");
        }

        if (selectedFrameFiles.length > 0) {
          const uploadedFrames = await uploads.uploadFiles(
            selectedFrameFiles,
            "selected-frames"
          );

          selectedFrames = [...selectedFrames, ...uploadedFrames];
        }

        if (aboutTeamGalleryFiles.length > 0) {
          const uploadedTeamGallery = await uploads.uploadFiles(
            aboutTeamGalleryFiles,
            "about-team-gallery"
          );

          aboutTeamGallery = [...aboutTeamGallery, ...uploadedTeamGallery];
        }

        if (aboutTeamMemberImageFiles.length > 0) {
          const uploadedTeamImages = await uploads.uploadFiles(
            aboutTeamMemberImageFiles.map((item) => item.file),
            "about-team"
          );

          uploadedTeamImages.forEach((image, fileIndex) => {
            const item = aboutTeamMemberImageFiles[fileIndex];
            aboutTeamMembers[item.index] = {
              ...aboutTeamMembers[item.index],
              image
            };
          });
        }

        uploads.finish();

        const nextFormState: SiteSettingsFormState = {
          ...formState,
          heroVideoUrl,
          selectedFramesText: selectedFrames.join("\n"),
          aboutTeamGalleryText: aboutTeamGallery.join("\n"),
          aboutTeamMembers
        };
        const payload = buildSiteSettingsDatabasePayload(nextFormState);
        const saveResult = await saveAdminSiteSettingsRecord(
          supabase,
          payload,
          {
            recordExists: hasPersistedSettingsRef.current,
            expectedUpdatedAt: hasPersistedSettingsRef.current
              ? formState.updatedAt
              : undefined
          }
        );

        if (!saveResult.ok) {
          await removeAdminFiles(supabase, newlyUploadedUrls);
          showStatus(saveResult.error.message);
          return false;
        }

        const savedState = toSiteSettingsFormState(
          normalizeSiteSettingsRecord(saveResult.data)
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
        const [cleanupCompleted, publicRefreshCompleted] = await Promise.all([
          removeUnreferencedAdminFiles(supabase, replacedMediaUrls),
          revalidateAdminPublicContent(supabase)
        ]);
        replaceForm(savedState);
        savedFormStateRef.current = savedState;
        hasPersistedSettingsRef.current = true;
        setSavedSnapshot(serializeSiteSettingsFormState(savedState));
        clearSiteSettingsMedia();
        clearSiteSettingsDraft();
        showStatus("Global site settings saved to Supabase.");
        setSaveReport(
          buildSiteSettingsSaveReport({
            heroVideoFile: siteHeroVideoFile,
            selectedFrameFiles,
            aboutTeamGalleryFiles,
            aboutTeamMemberImageFiles: aboutTeamMemberImageFiles.map(
              (item) => item.file
            ),
            cleanupCompleted,
            publicRefreshCompleted
          })
        );
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
        finishWorking();
      }
    },
    [
      aboutTeamGalleryFiles,
      aboutTeamMemberImageFiles,
      clearSiteSettingsMedia,
      finishWorking,
      formState,
      replaceForm,
      selectedFrameFiles,
      sessionEmail,
      setSaveReport,
      setUploadProgress,
      showStatus,
      siteHeroVideoFile,
      supabase,
      tryStartWorking
    ]
  );

  const reset = useCallback(() => {
    replaceForm(savedFormStateRef.current);
    clearSiteSettingsMedia();
    clearSiteSettingsDraft();
    setSaveReport(null);
    showStatus("Site settings restored to the last saved state.");
  }, [clearSiteSettingsMedia, replaceForm, setSaveReport, showStatus]);

  return {
    formState,
    isDirty,
    load,
    save,
    reset,
    updateField
  };
}
