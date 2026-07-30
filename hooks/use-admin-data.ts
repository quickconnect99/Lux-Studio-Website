"use client";

import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState
} from "react";
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
  buildRemoteProjectSaveReport,
  withAdminSaveWarnings
} from "@/lib/admin-save-report";
import {
  createAdminUploadSession,
  removeAdminFiles,
  removeUnreferencedAdminFiles,
  revalidateAdminPublicContent
} from "@/lib/admin-storage";
import {
  createBrowserSupabaseClient,
  isSupabaseConfigured
} from "@/lib/supabase";
import type {
  AdminConfirmDialogState,
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

type PendingAdminWorkflow = {
  run(): void | Promise<void>;
  saveScope: "project" | "settings" | "both" | null;
};

/**
 * Composes the complete admin workspace from smaller, focused hooks.
 *
 * This is the orchestration layer between the dashboard UI and persistence:
 * it loads projects, coordinates project and Site Settings state, uploads
 * queued media before database writes, protects dirty work during navigation,
 * and refreshes the public cache after successful mutations.
 *
 * Components should consume the returned state and callbacks instead of
 * talking to Supabase directly. Database mapping belongs in the repository and
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
  const [workflowConfirmDialog, setWorkflowConfirmDialog] =
    useState<AdminConfirmDialogState | null>(null);
  const pendingWorkflowRef = useRef<PendingAdminWorkflow | null>(null);
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
    confirmDialog: projectConfirmDialog,
    updateField,
    updateCaption,
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
    resolveConfirmDialogAction,
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
    clearMedia,
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
  }, [applyProject, defaultTemplate]);

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

  const handleKeyboardSave = useEffectEvent(() => {
    if (workingRef.current) return;

    if (activeTab === "settings") {
      if (isSettingsDirty) void handleSaveSiteSettings();
      return;
    }

    if (isDirty && isProjectComplete) void handleSave();
  });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        handleKeyboardSave();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  async function handleSave(event?: {
    preventDefault(): void;
  }): Promise<boolean> {
    event?.preventDefault();

    if (!tryStartWorking()) {
      return false;
    }

    const newlyUploadedUrls: string[] = [];

    try {
      if (!isProjectComplete) {
        showStatus(
          `Project not saved. Complete these fields first: ${completionIssues.join(", ")}.`
        );
        return false;
      }

      const slugResult = await checkSlugAvailability(
        formState.slug || formState.title,
        { showAvailableState: false }
      );
      if (!slugResult.ok) {
        showStatus(
          "Project not saved. Resolve the slug conflict before saving."
        );
        return false;
      }

      const targetSlug = slugResult.slug;
      const isTemplateSource = Boolean(formState.templateBusiness);
      setSaveReport(null);
      let coverImage = formState.coverImage;
      let uploadedVideo = formState.uploadedVideo;
      let galleryImages = parseMultilineInput(formState.galleryImagesText);
      const galleryCaptions = formState.galleryCaptionsText
        .split("\n")
        .map((value) => value.trim());
      let shouldClearQueuedMedia = true;
      let nextReport: AdminSaveReport | null = null;

      if (supabase && sessionEmail) {
        // Upload first, write the new references second, and only then remove
        // replaced files. This order keeps the currently published project
        // intact if either an upload or the database mutation fails.
        const previousMediaUrls = [
          formState.coverImage,
          ...parseMultilineInput(formState.galleryImagesText),
          formState.uploadedVideo
        ].filter(Boolean);
        const totalFiles =
          (coverFile ? 1 : 0) + (videoFile ? 1 : 0) + galleryFiles.length;
        const uploads = createAdminUploadSession({
          supabase,
          totalFiles,
          onProgress: setUploadProgress,
          onUploaded: (publicUrl) => newlyUploadedUrls.push(publicUrl)
        });

        if (coverFile) {
          coverImage = await uploads.uploadFile(coverFile, "covers");
        }

        if (videoFile) {
          uploadedVideo = await uploads.uploadFile(videoFile, "videos");
        }

        if (galleryFiles.length > 0) {
          const uploaded = await uploads.uploadFiles(galleryFiles, "gallery");
          galleryImages = [...galleryImages, ...uploaded];
        }
        uploads.finish();

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
        const saveResult = await saveAdminProjectRecord(supabase, payload, {
          expectedUpdatedAt: formState.id ? formState.updatedAt : undefined
        });

        if (!saveResult.ok) {
          await removeAdminFiles(supabase, newlyUploadedUrls);
          showStatus(saveResult.error.message);
          return false;
        }

        const currentMediaUrls = [
          media.coverImage,
          ...media.galleryImages,
          media.uploadedVideo
        ].filter(Boolean);
        const replacedMediaUrls = previousMediaUrls.filter(
          (url) => !currentMediaUrls.includes(url)
        );
        const [cleanupCompleted, publicRefreshCompleted] = await Promise.all([
          removeUnreferencedAdminFiles(supabase, replacedMediaUrls),
          revalidateAdminPublicContent(supabase)
        ]);

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
        nextReport = withAdminSaveWarnings(
          buildRemoteProjectSaveReport({
            isTemplateSource,
            coverFile,
            galleryFiles,
            videoFile
          }),
          { cleanupCompleted, publicRefreshCompleted }
        );
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
      return true;
    } catch (error) {
      setUploadProgress(null);
      if (supabase && newlyUploadedUrls.length > 0) {
        await removeAdminFiles(supabase, newlyUploadedUrls);
      }
      showStatus(
        toAdminOperationError(error, "The project could not be saved.").message
      );
      return false;
    } finally {
      finishWorking();
    }
  }

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

    if (!tryStartWorking()) {
      return;
    }

    setSaveReport(null);

    try {
      let cleanupCompleted = true;
      let publicRefreshCompleted = true;

      if (supabase && sessionEmail) {
        const deletedMediaUrls = [
          formState.coverImage,
          ...parseMultilineInput(formState.galleryImagesText),
          formState.uploadedVideo
        ].filter(Boolean);
        const deleteResult = await deleteAdminProjectRecord(
          supabase,
          formState.id,
          formState.updatedAt
        );
        if (!deleteResult.ok) {
          showStatus(deleteResult.error.message);
          return;
        }
        [cleanupCompleted, publicRefreshCompleted] = await Promise.all([
          removeUnreferencedAdminFiles(supabase, deletedMediaUrls),
          revalidateAdminPublicContent(supabase)
        ]);
      }

      const next = removeAdminProjectFromList(projects, formState.id);
      setProjects(next);
      applyProject(next[0] ?? defaultTemplate);
      setStatusMessage(
        sessionEmail
          ? "Project deleted from Supabase."
          : "Project removed from session."
      );
      setSaveReport(
        withAdminSaveWarnings(
          {
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
          },
          { cleanupCompleted, publicRefreshCompleted }
        )
      );
    } catch (error) {
      showStatus(
        toAdminOperationError(error, "The project could not be deleted.")
          .message
      );
    } finally {
      finishWorking();
    }
  }

  function openWorkflowConfirmation({
    title,
    description,
    confirmLabel = "Save and continue",
    saveScope,
    run
  }: PendingAdminWorkflow & {
    title: string;
    description: string;
    confirmLabel?: string;
  }) {
    pendingWorkflowRef.current = { run, saveScope };
    setWorkflowConfirmDialog({
      action: "workflow",
      title,
      description,
      confirmLabel,
      secondaryLabel: saveScope ? "Discard changes" : undefined,
      tone: "default",
      inputValue: ""
    });
  }

  function closeConfirmDialog() {
    if (workingRef.current) return;

    if (workflowConfirmDialog) {
      pendingWorkflowRef.current = null;
      setWorkflowConfirmDialog(null);
      return;
    }

    closeProjectConfirmDialog();
  }

  function updateConfirmDialogInput(value: string) {
    if (!workflowConfirmDialog) {
      updateProjectConfirmDialogInput(value);
    }
  }

  async function runPendingWorkflow() {
    const pending = pendingWorkflowRef.current;
    if (!pending) return;

    if (
      (pending.saveScope === "project" || pending.saveScope === "both") &&
      isDirty
    ) {
      clearDraft(selectedProjectKey);
    }
    pendingWorkflowRef.current = null;
    setWorkflowConfirmDialog(null);
    await pending.run();
  }

  async function confirmDialogAction() {
    if (workflowConfirmDialog) {
      const scope = pendingWorkflowRef.current?.saveScope;
      let saved = true;

      if ((scope === "project" || scope === "both") && isDirty) {
        saved = await handleSave();
      }
      if (
        saved &&
        (scope === "settings" || scope === "both") &&
        isSettingsDirty
      ) {
        saved = await handleSaveSiteSettings();
      }

      if (saved) {
        await runPendingWorkflow();
      }
      return;
    }

    if (resolveConfirmDialogAction() === "delete") {
      await performDelete();
    }
  }

  async function secondaryDialogAction() {
    if (workflowConfirmDialog) {
      await runPendingWorkflow();
    }
  }

  function selectProject(project: AdminProjectListItem) {
    if (project.adminKey === selectedProjectKey) return;
    if (!isDirty) {
      selectProjectImmediately(project);
      return;
    }

    openWorkflowConfirmation({
      title: "Save project changes?",
      description: `You have unsaved changes in "${formState.title}". Save them before opening "${project.title}", or discard them to continue without saving.`,
      saveScope: "project",
      run: () => selectProjectImmediately(project)
    });
  }

  function newProject() {
    if (!isDirty) {
      newProjectImmediately();
      return;
    }

    openWorkflowConfirmation({
      title: "Save changes before starting a new project?",
      description:
        "The current project contains unsaved edits. Save them first, discard them, or cancel to stay in the editor.",
      saveScope: "project",
      run: newProjectImmediately
    });
  }

  function handleResetClick() {
    if (workingRef.current) return;

    if (activeTab === "projects") {
      handleProjectResetClick();
      return;
    }

    if (!isSettingsDirty) {
      resetSiteSettings();
      return;
    }

    openWorkflowConfirmation({
      title: "Reset site settings?",
      description:
        "This restores the last saved site settings and removes every unsaved text and media change from the preview.",
      confirmLabel: "Reset settings",
      saveScope: null,
      run: resetSiteSettings
    });
  }

  function handleSignOut() {
    if (workingRef.current) return;

    if (!isDirty && !isSettingsDirty) {
      void handleSignOutImmediately();
      return;
    }

    const saveScope =
      isDirty && isSettingsDirty ? "both" : isDirty ? "project" : "settings";
    openWorkflowConfirmation({
      title: "Save changes before signing out?",
      description:
        "Signing out resets the current admin workspace. Save the outstanding changes first, discard them, or cancel to continue editing.",
      saveScope,
      run: handleSignOutImmediately
    });
  }

  const confirmDialog = workflowConfirmDialog ?? projectConfirmDialog;

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
    secondaryDialogAction,
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
