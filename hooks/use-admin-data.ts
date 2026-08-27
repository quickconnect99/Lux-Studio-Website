"use client";

import { useCallback, useRef, useState } from "react";
import { useAdminDraft } from "@/hooks/use-admin-draft";
import { useAdminMedia } from "@/hooks/use-admin-media";
import { useAdminProjectWorkspace } from "@/hooks/use-admin-project-workspace";
import { useAdminSession } from "@/hooks/use-admin-session";
import { useAdminSiteSettings } from "@/hooks/use-admin-site-settings";
import { useAdminWorkflow } from "@/hooks/use-admin-workflow";
import { useForm } from "@/hooks/use-form";
import { loadAdminProjects } from "@/lib/admin-project-repository";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type {
  AdminProjectListItem,
  AdminSaveReport,
  AdminTab,
  AdminUploadProgress
} from "@/lib/admin-types";
import { projectTemplates } from "@/lib/admin-utils";

const EMPTY_AUTH_FORM = { email: "", password: "" };
const DEFAULT_STATUS_MESSAGE =
  "Two starter templates are always available. Editing one and saving creates a new project.";

/**
 * Composes the complete admin workspace from smaller, focused hooks.
 *
 * This is the orchestration layer between the dashboard UI and persistence:
 * it loads projects, coordinates project and Site Settings state, and
 * delegates save/delete persistence plus the unsaved-changes workflow guard
 * to `useAdminWorkflow`. Database mapping belongs in the repository and
 * persistence modules, while visual components remain render layers.
 *
 * @returns All state and actions required by `AdminDashboard`.
 */
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
  const [working, setWorkingState] = useState(false);
  const [uploadProgress, setUploadProgress] =
    useState<AdminUploadProgress | null>(null);
  const hasAppliedInitialProject = useRef(false);
  const workingRef = useRef(false);

  const setWorking = useCallback((nextWorking: boolean) => {
    workingRef.current = nextWorking;
    setWorkingState(nextWorking);
  }, []);

  const tryStartWorking = useCallback(() => {
    if (workingRef.current) {
      return false;
    }

    workingRef.current = true;
    setWorkingState(true);
    return true;
  }, []);

  const finishWorking = useCallback(() => {
    workingRef.current = false;
    setWorkingState(false);
  }, []);

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
    aboutTeamGalleryFiles,
    aboutTeamMemberImageFiles,
    coverPreviewUrl,
    setCoverFile,
    setVideoFile,
    setSiteHeroVideoFile,
    addGalleryFiles,
    removeGalleryFile,
    addSelectedFrameFiles,
    removeSelectedFrameFile,
    addAboutTeamGalleryFiles,
    removeAboutTeamGalleryFile,
    setAboutTeamMemberImageFile,
    removeAboutTeamMemberImageFile,
    moveAboutTeamMemberImageFile,
    handleFileSelection,
    clearProjectMedia,
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
    altRawLines,
    completionIssues,
    isProjectComplete,
    isDirty,
    isTemplateProject,
    coverPreviewImage,
    slugValidation,
    confirmDialog: projectConfirmDialog,
    updateField,
    updateCaption,
    updateAlt,
    applyProject,
    commitSavedProject,
    restoreDraft,
    checkSlugAvailability,
    handleSlugBlur,
    applySuggestedSlug,
    handleResetClick: handleProjectResetClick,
    openDeleteDialog,
    closeConfirmDialog: closeProjectConfirmDialog,
    updateConfirmDialogInput: updateProjectConfirmDialogInput,
    resolveConfirmDialogAction: resolveProjectConfirmDialogAction,
    selectProject: selectProjectImmediately,
    newProject: newProjectImmediately,
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
    clearProjectMedia,
    clearSaveReport,
    showStatus
  });

  const {
    formState: siteSettingsFormState,
    isDirty: isSettingsDirty,
    load: loadSiteSettings,
    save: handleSaveSiteSettings,
    reset: resetSiteSettings,
    updateField: updateSiteSettingsField
  } = useAdminSiteSettings({
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
  });

  const { clearDraft } = useAdminDraft({
    enabled: true,
    projectKey: selectedProjectKey,
    formState,
    isDirty,
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
    clearSiteSettingsMedia();
  }, [applyProject, clearSiteSettingsMedia, defaultTemplate]);

  const handleSignInSuccess = useCallback(() => {
    // Project-scoped recovery drafts remain available after authentication.
  }, []);

  const {
    handleSignIn,
    handleSignOut: handleSignOutImmediately,
    signInMessage
  } = useAdminSession({
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

  const {
    confirmDialog,
    closeConfirmDialog,
    updateConfirmDialogInput,
    confirmDialogAction,
    secondaryDialogAction,
    handleSave,
    handleResetClick,
    selectProject,
    newProject,
    handleSignOut
  } = useAdminWorkflow({
    supabase,
    sessionEmail,
    activeTab,
    working,
    tryStartWorking,
    finishWorking,
    showStatus,
    setStatusMessage,
    setSaveReport,
    setUploadProgress,
    projects,
    setProjects,
    defaultTemplate,
    applyProject,
    formState,
    selectedProjectKey,
    completionIssues,
    isProjectComplete,
    isDirty,
    checkSlugAvailability,
    commitSavedProject,
    resolveProjectConfirmDialogAction,
    projectConfirmDialog,
    closeProjectConfirmDialog,
    updateProjectConfirmDialogInput,
    selectProjectImmediately,
    newProjectImmediately,
    handleProjectResetClick,
    coverFile,
    galleryFiles,
    videoFile,
    clearProjectMedia,
    clearDraft,
    isSettingsDirty,
    handleSaveSiteSettings,
    resetSiteSettings,
    handleSignOutImmediately
  });

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
    signInMessage,
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
    aboutTeamGalleryFiles,
    aboutTeamMemberImageFiles,
    setSiteHeroVideoFile,
    addSelectedFrameFiles,
    removeSelectedFrameFile,
    addAboutTeamGalleryFiles,
    removeAboutTeamGalleryFile,
    setAboutTeamMemberImageFile,
    removeAboutTeamMemberImageFile,
    moveAboutTeamMemberImageFile,
    formState,
    isTemplateProject,
    updateField,
    completionIssues,
    isProjectComplete,
    isDirty,
    galleryImageList,
    captionRawLines,
    altRawLines,
    slugValidation,
    handleSlugBlur,
    applySuggestedSlug,
    confirmDialog,
    closeConfirmDialog,
    updateConfirmDialogInput,
    confirmDialogAction,
    secondaryDialogAction,
    updateCaption,
    updateAlt,
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
