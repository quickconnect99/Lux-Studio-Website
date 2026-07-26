"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAdminDraft } from "@/hooks/use-admin-draft";
import { useAdminMedia } from "@/hooks/use-admin-media";
import { useAdminProjectWorkspace } from "@/hooks/use-admin-project-workspace";
import { useAdminSession } from "@/hooks/use-admin-session";
import { useAdminSiteSettings } from "@/hooks/use-admin-site-settings";
import { useForm } from "@/hooks/use-form";
import {
  buildLocalProject,
  buildProjectDatabasePayload,
  getProjectMediaState
} from "@/lib/admin-persistence";
import {
  deleteAdminProjectRecord,
  loadAdminProjects,
  mergeAdminProjectList,
  removeAdminProjectFromList,
  saveAdminProjectRecord
} from "@/lib/admin-project-repository";
import { toAdminOperationError } from "@/lib/admin-result";
import {
  buildLocalProjectSaveReport,
  buildRemoteProjectSaveReport
} from "@/lib/admin-save-report";
import {
  revalidateAdminPublicContent,
  uploadAdminFile
} from "@/lib/admin-storage";
import {
  createBrowserSupabaseClient,
  isSupabaseConfigured
} from "@/lib/supabase";
import type {
  AdminProjectListItem,
  AdminSaveReport,
  AdminTab,
  AdminUploadProgress
} from "@/lib/admin-types";
import {
  parseMultilineInput,
  projectTemplates,
  toAdminProjectListItem
} from "@/lib/admin-utils";

const EMPTY_AUTH_FORM = { email: "", password: "" };
const DEFAULT_STATUS_MESSAGE =
  "Two starter templates are always available. Editing one and saving creates a new project.";

export function useAdminData() {
  const supabase = createBrowserSupabaseClient();
  const templateProjects = projectTemplates;
  const defaultTemplate = templateProjects[0];
  const authForm = useForm(EMPTY_AUTH_FORM);

  const [activeTab, setActiveTab] = useState<AdminTab>("projects");
  const [projects, setProjects] = useState<AdminProjectListItem[]>([]);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState(DEFAULT_STATUS_MESSAGE);
  const [saveReport, setSaveReport] = useState<AdminSaveReport | null>(null);
  const [working, setWorking] = useState(false);
  const [uploadProgress, setUploadProgress] =
    useState<AdminUploadProgress | null>(null);
  const hasAppliedInitialProject = useRef(false);

  const {
    values: authFormState,
    updateField: updateAuthFormField,
    reset: resetAuthForm
  } = authForm;

  const showStatus = useCallback((message: string) => {
    setSaveReport(null);
    setStatusMessage(message);
  }, []);

  const clearSaveReport = useCallback(() => {
    setSaveReport(null);
  }, []);

  const {
    coverFile,
    galleryFiles,
    videoFile,
    siteHeroVideoFile,
    selectedFrameFiles,
    aboutTeamMemberImageFiles,
    coverPreviewUrl,
    setCoverFile,
    setVideoFile,
    setSiteHeroVideoFile,
    addGalleryFiles,
    removeGalleryFile,
    addSelectedFrameFiles,
    removeSelectedFrameFile,
    setAboutTeamMemberImageFile,
    handleFileSelection,
    clearMedia,
    clearSiteSettingsMedia
  } = useAdminMedia({
    onChange: clearSaveReport,
    onError: showStatus
  });

  const {
    formState,
    selectedProjectKey,
    saveCount,
    galleryImageList,
    captionRawLines,
    completionIssues,
    isProjectComplete,
    isDirty,
    isTemplateProject,
    coverPreviewImage,
    slugValidation,
    confirmDialog,
    updateField,
    updateCaption,
    applyProject,
    commitSavedProject,
    restoreDraft,
    checkSlugAvailability,
    handleSlugBlur,
    applySuggestedSlug,
    handleResetClick,
    openDeleteDialog,
    closeConfirmDialog,
    updateConfirmDialogInput,
    resolveConfirmDialogAction,
    selectProject,
    newProject,
    duplicateProject
  } = useAdminProjectWorkspace({
    supabase,
    sessionEmail,
    projects,
    templateProjects,
    defaultTemplate,
    coverFile,
    galleryFiles,
    videoFile,
    coverPreviewUrl,
    working,
    clearMedia,
    clearSaveReport,
    showStatus
  });

  const {
    formState: siteSettingsFormState,
    isDirty: isSettingsDirty,
    load: loadSiteSettings,
    save: handleSaveSiteSettings,
    updateField: updateSiteSettingsField
  } = useAdminSiteSettings({
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
  });

  const { clearDraft } = useAdminDraft({
    enabled: !isSupabaseConfigured,
    sessionEmail,
    formState,
    onRestore: restoreDraft
  });

  const loadProjects = useCallback(async () => {
    if (!supabase) return;
    const result = await loadAdminProjects(supabase);

    if (!result.ok) {
      showStatus(result.error.message);
      return;
    }

    const normalized = result.data;
    if (normalized.length === 0) {
      setProjects([]);
      if (!hasAppliedInitialProject.current) {
        hasAppliedInitialProject.current = true;
        applyProject(defaultTemplate);
      }
      return;
    }

    setProjects(normalized);
    if (!hasAppliedInitialProject.current) {
      hasAppliedInitialProject.current = true;
      applyProject(
        normalized.find((project) => project.published) ??
          normalized[0] ??
          defaultTemplate
      );
    }
  }, [applyProject, defaultTemplate, showStatus, supabase]);

  const resetSessionWorkspace = useCallback(() => {
    setProjects([]);
    hasAppliedInitialProject.current = false;
    applyProject(defaultTemplate);
  }, [applyProject, defaultTemplate]);

  const handleSignInSuccess = useCallback(() => {
    clearDraft();
  }, [clearDraft]);

  const { handleSignIn, handleSignOut } = useAdminSession({
    supabase,
    credentials: authFormState,
    setSessionEmail,
    setWorking,
    onBeforeAuth: clearSaveReport,
    onAuthorized: loadProjects,
    onBootstrap: loadSiteSettings,
    onSessionEnded: resetSessionWorkspace,
    onSignInSuccess: handleSignInSuccess,
    resetCredentials: resetAuthForm,
    showStatus
  });

  const handleSaveRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        handleSaveRef.current?.();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  async function handleSave(event?: { preventDefault(): void }) {
    event?.preventDefault();

    if (!isProjectComplete) {
      showStatus(
        `Project not saved. Complete these fields first: ${completionIssues.join(", ")}.`
      );
      return;
    }

    const slugResult = await checkSlugAvailability(
      formState.slug || formState.title,
      { showAvailableState: false }
    );
    if (!slugResult.ok) {
      showStatus("Project not saved. Resolve the slug conflict before saving.");
      return;
    }

    const targetSlug = slugResult.slug;
    const isTemplateSource = Boolean(formState.templateBusiness);
    setSaveReport(null);
    setWorking(true);

    try {
      let coverImage = formState.coverImage;
      let uploadedVideo = formState.uploadedVideo;
      let galleryImages = parseMultilineInput(formState.galleryImagesText);
      const galleryCaptions = formState.galleryCaptionsText
        .split("\n")
        .map((value) => value.trim());
      let shouldClearQueuedMedia = true;
      let nextReport: AdminSaveReport | null = null;

      if (supabase && sessionEmail) {
        const totalFiles =
          (coverFile ? 1 : 0) +
          (videoFile ? 1 : 0) +
          galleryFiles.length;
        let uploadedCount = 0;

        if (coverFile) {
          setUploadProgress({
            current: ++uploadedCount,
            total: totalFiles,
            filename: coverFile.name
          });
          coverImage = await uploadAdminFile(
            supabase,
            coverFile,
            "covers"
          );
        }

        if (videoFile) {
          setUploadProgress({
            current: ++uploadedCount,
            total: totalFiles,
            filename: videoFile.name
          });
          uploadedVideo = await uploadAdminFile(
            supabase,
            videoFile,
            "videos"
          );
        }

        if (galleryFiles.length > 0) {
          const uploaded: string[] = [];
          for (const file of galleryFiles) {
            setUploadProgress({
              current: ++uploadedCount,
              total: totalFiles,
              filename: file.name
            });
            uploaded.push(
              await uploadAdminFile(supabase, file, "gallery")
            );
          }
          galleryImages = [...galleryImages, ...uploaded];
        }
        setUploadProgress(null);

        const media = getProjectMediaState(formState, {
          coverImage,
          galleryImages,
          galleryCaptions,
          uploadedVideo
        });
        const payload = buildProjectDatabasePayload({
          formState,
          slug: targetSlug,
          media
        });
        const saveResult = await saveAdminProjectRecord(supabase, payload);

        if (!saveResult.ok) {
          showStatus(saveResult.error.message);
          return;
        }

        const saved = saveResult.data;
        setProjects(
          mergeAdminProjectList(projects, saved, {
            sortByCreatedAt: true
          })
        );
        commitSavedProject(saved);
        setStatusMessage(
          isTemplateSource
            ? "New project created from template and saved to Supabase."
            : "Project saved to Supabase."
        );
        void revalidateAdminPublicContent(supabase);
        nextReport = buildRemoteProjectSaveReport({
          isTemplateSource,
          coverFile,
          galleryFiles,
          videoFile
        });
      } else {
        const media = getProjectMediaState(formState, {
          coverImage,
          galleryImages,
          galleryCaptions,
          uploadedVideo
        });
        const saved = toAdminProjectListItem(
          buildLocalProject({
            formState,
            slug: targetSlug,
            media
          })
        );

        setProjects(mergeAdminProjectList(projects, saved));
        commitSavedProject(saved);
        shouldClearQueuedMedia =
          !coverFile && galleryFiles.length === 0 && !videoFile;
        setStatusMessage(
          isSupabaseConfigured
            ? "Sign in to persist changes to Supabase."
            : isTemplateSource
              ? "New project created locally from template."
              : "Draft saved to browser storage."
        );
        nextReport = buildLocalProjectSaveReport({
          isSupabaseConfigured,
          coverFile,
          galleryFiles,
          videoFile
        });
      }

      if (shouldClearQueuedMedia) clearMedia();
      setSaveReport(nextReport);
    } catch (error) {
      setUploadProgress(null);
      showStatus(
        toAdminOperationError(
          error,
          "The project could not be saved."
        ).message
      );
    } finally {
      setWorking(false);
    }
  }

  useEffect(() => {
    handleSaveRef.current = () => {
      if (!working && isProjectComplete) void handleSave();
    };
  });

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (isDirty || isSettingsDirty) event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty, isSettingsDirty]);

  async function performDelete() {
    if (formState.templateBusiness) {
      showStatus(
        "Templates are permanent starting points and cannot be deleted."
      );
      return;
    }

    if (!formState.id) {
      showStatus("This project has no database ID and cannot be deleted.");
      return;
    }

    setSaveReport(null);
    setWorking(true);

    try {
      if (supabase && sessionEmail) {
        const deleteResult = await deleteAdminProjectRecord(
          supabase,
          formState.id
        );
        if (!deleteResult.ok) {
          showStatus(deleteResult.error.message);
          return;
        }
        void revalidateAdminPublicContent(supabase);
      }

      const next = removeAdminProjectFromList(projects, formState.id);
      setProjects(next);
      applyProject(next[0] ?? defaultTemplate);
      setStatusMessage(
        sessionEmail
          ? "Project deleted from Supabase."
          : "Project removed from session."
      );
      setSaveReport({
        title: "Project deleted",
        items: [
          {
            id: "delete",
            label: sessionEmail
              ? "Project removed from Supabase"
              : "Project removed from the current session",
            tone: "success"
          }
        ]
      });
    } catch (error) {
      showStatus(
        toAdminOperationError(error, "The project could not be deleted.")
          .message
      );
    } finally {
      setWorking(false);
    }
  }

  async function confirmDialogAction() {
    if (resolveConfirmDialogAction() === "delete") {
      await performDelete();
    }
  }

  return {
    activeTab,
    setActiveTab,
    templateProjects,
    projects,
    selectedProjectKey,
    saveCount,
    sessionEmail,
    authFormState,
    updateAuthFormField,
    handleSignIn,
    handleSignOut,
    statusMessage,
    saveReport,
    working,
    uploadProgress,
    coverFile,
    coverPreviewImage,
    setCoverFile,
    galleryFiles,
    videoFile,
    setVideoFile,
    siteHeroVideoFile,
    selectedFrameFiles,
    aboutTeamMemberImageFiles,
    setSiteHeroVideoFile,
    addSelectedFrameFiles,
    removeSelectedFrameFile,
    setAboutTeamMemberImageFile,
    formState,
    isTemplateProject,
    updateField,
    completionIssues,
    isProjectComplete,
    isDirty,
    galleryImageList,
    captionRawLines,
    slugValidation,
    handleSlugBlur,
    applySuggestedSlug,
    confirmDialog,
    closeConfirmDialog,
    updateConfirmDialogInput,
    confirmDialogAction,
    updateCaption,
    handleFileSelection,
    addGalleryFiles,
    removeGalleryFile,
    handleSave,
    handleDeleteClick: openDeleteDialog,
    handleResetClick,
    selectProject,
    newProject,
    duplicateProject,
    siteSettingsFormState,
    isSettingsDirty,
    updateSiteSettingsField,
    handleSaveSiteSettings
  };
}
