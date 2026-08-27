"use client";

import {
  useCallback,
  useEffect,
  useEffectEvent,
  useReducer,
  useRef
} from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildLocalProject,
  buildProjectDatabasePayload,
  getProjectMediaState
} from "@/lib/admin-persistence";
import {
  deleteAdminProjectRecord,
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
import { isSupabaseConfigured } from "@/lib/supabase";
import type {
  AdminConfirmDialogState,
  AdminProjectListItem,
  AdminSaveReport,
  AdminTab,
  ProjectFormState
} from "@/lib/admin-types";
import { parseMultilineInput, toAdminProjectListItem } from "@/lib/admin-utils";

export type PendingAdminWorkflow = {
  run(): void | Promise<void>;
  saveScope: "project" | "settings" | "both" | null;
};

type WorkflowDialogState =
  | { status: "idle" }
  | {
      status: "confirming";
      dialog: AdminConfirmDialogState;
      pending: PendingAdminWorkflow;
    };

type WorkflowDialogAction =
  | {
      type: "open";
      dialog: AdminConfirmDialogState;
      pending: PendingAdminWorkflow;
    }
  | { type: "close" };

function workflowDialogReducer(
  state: WorkflowDialogState,
  action: WorkflowDialogAction
): WorkflowDialogState {
  switch (action.type) {
    case "open":
      return {
        status: "confirming",
        dialog: action.dialog,
        pending: action.pending
      };
    case "close":
      return { status: "idle" };
    default:
      return state;
  }
}

type UseAdminWorkflowOptions = {
  supabase: SupabaseClient | null;
  sessionEmail: string | null;
  activeTab: AdminTab;
  working: boolean;
  tryStartWorking(): boolean;
  finishWorking(): void;
  showStatus(message: string): void;
  setStatusMessage(message: string): void;
  setSaveReport(report: AdminSaveReport | null): void;
  setUploadProgress(
    progress: { current: number; total: number; filename: string } | null
  ): void;

  projects: AdminProjectListItem[];
  setProjects(projects: AdminProjectListItem[]): void;
  defaultTemplate: AdminProjectListItem;
  applyProject(project: AdminProjectListItem): void;

  formState: ProjectFormState;
  selectedProjectKey: string;
  completionIssues: string[];
  isProjectComplete: boolean;
  isDirty: boolean;
  checkSlugAvailability: (
    rawValue?: string,
    options?: { showAvailableState?: boolean }
  ) => Promise<{ ok: boolean; slug: string; suggestedSlug?: string | null }>;
  commitSavedProject(saved: AdminProjectListItem): void;
  resolveProjectConfirmDialogAction(): "delete" | null;
  projectConfirmDialog: AdminConfirmDialogState | null;
  closeProjectConfirmDialog(): void;
  updateProjectConfirmDialogInput(value: string): void;
  selectProjectImmediately(project: AdminProjectListItem): void;
  newProjectImmediately(): void;
  handleProjectResetClick(): void;

  coverFile: File | null;
  galleryFiles: File[];
  videoFile: File | null;
  clearProjectMedia(): void;
  clearDraft(projectKey: string): void;

  isSettingsDirty: boolean;
  handleSaveSiteSettings(): Promise<boolean>;
  resetSiteSettings(): void;

  handleSignOutImmediately(): Promise<void>;
};

/**
 * Owns save/delete persistence and the cross-domain "unsaved changes" guard
 * that protects both project and Site Settings edits during navigation,
 * resets, and sign-out.
 *
 * The workflow confirmation dialog is a small state machine (idle vs.
 * confirming a pending action) modeled with `useReducer` instead of a loose
 * dialog-state/pending-ref pair, so every transition is explicit and testable
 * in isolation from the rest of the admin workspace.
 */
export function useAdminWorkflow({
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
}: UseAdminWorkflowOptions) {
  const [dialogState, dispatchDialog] = useReducer(workflowDialogReducer, {
    status: "idle"
  });
  const pendingRef = useRef<PendingAdminWorkflow | null>(null);

  const handleSave = useCallback(
    async (event?: { preventDefault(): void }): Promise<boolean> => {
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
        // Kept index-aligned with galleryCaptions (see getProjectMediaState);
        // newly uploaded files are appended as unfiltered, caption-less
        // entries below, which normalizeProjectGallery accepts fine.
        let galleryImages = formState.galleryImagesText.split("\n");
        const galleryCaptions = formState.galleryCaptionsText.split("\n");
        const galleryAlts = formState.galleryAltsText.split("\n");
        let shouldClearQueuedMedia = true;
        let nextReport: AdminSaveReport | null = null;

        if (supabase && sessionEmail) {
          // Upload first, write the new references second, and only then
          // remove replaced files. This order keeps the currently published
          // project intact if either an upload or the database mutation
          // fails.
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
            galleryAlts,
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
            mergeAdminProjectList(projects, saved, { sortByCreatedAt: true })
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
            galleryAlts,
            uploadedVideo
          });
          const saved = toAdminProjectListItem(
            buildLocalProject({ formState, slug: targetSlug, media })
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
                : "Draft saved in this browser session."
          );
          nextReport = buildLocalProjectSaveReport({
            coverFile,
            galleryFiles,
            videoFile
          });
        }

        if (shouldClearQueuedMedia) clearProjectMedia();
        setSaveReport(nextReport);
        return true;
      } catch (error) {
        setUploadProgress(null);
        if (supabase && newlyUploadedUrls.length > 0) {
          await removeAdminFiles(supabase, newlyUploadedUrls);
        }
        showStatus(
          toAdminOperationError(error, "The project could not be saved.")
            .message
        );
        return false;
      } finally {
        finishWorking();
      }
    },
    [
      checkSlugAvailability,
      clearProjectMedia,
      commitSavedProject,
      completionIssues,
      coverFile,
      finishWorking,
      formState,
      galleryFiles,
      isProjectComplete,
      projects,
      sessionEmail,
      setProjects,
      setSaveReport,
      setStatusMessage,
      setUploadProgress,
      showStatus,
      supabase,
      tryStartWorking,
      videoFile
    ]
  );

  const performDelete = useCallback(async () => {
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
  }, [
    applyProject,
    defaultTemplate,
    finishWorking,
    formState,
    projects,
    sessionEmail,
    setProjects,
    setSaveReport,
    setStatusMessage,
    showStatus,
    supabase,
    tryStartWorking
  ]);

  const openWorkflowConfirmation = useCallback(
    ({
      title,
      description,
      confirmLabel = "Save and continue",
      saveScope,
      run
    }: PendingAdminWorkflow & {
      title: string;
      description: string;
      confirmLabel?: string;
    }) => {
      pendingRef.current = { run, saveScope };
      dispatchDialog({
        type: "open",
        dialog: {
          action: "workflow",
          title,
          description,
          confirmLabel,
          secondaryLabel: saveScope ? "Discard changes" : undefined,
          tone: "default",
          inputValue: ""
        },
        pending: { run, saveScope }
      });
    },
    []
  );

  const closeConfirmDialog = useCallback(() => {
    if (working) return;

    if (dialogState.status === "confirming") {
      pendingRef.current = null;
      dispatchDialog({ type: "close" });
      return;
    }

    closeProjectConfirmDialog();
  }, [closeProjectConfirmDialog, dialogState.status, working]);

  const updateConfirmDialogInput = useCallback(
    (value: string) => {
      if (dialogState.status !== "confirming") {
        updateProjectConfirmDialogInput(value);
      }
    },
    [dialogState.status, updateProjectConfirmDialogInput]
  );

  const runPendingWorkflow = useCallback(async () => {
    const pending = pendingRef.current;
    if (!pending) return;

    if (
      (pending.saveScope === "project" || pending.saveScope === "both") &&
      isDirty
    ) {
      clearDraft(selectedProjectKey);
    }
    pendingRef.current = null;
    dispatchDialog({ type: "close" });
    await pending.run();
  }, [clearDraft, isDirty, selectedProjectKey]);

  const confirmDialogAction = useCallback(async () => {
    if (dialogState.status === "confirming") {
      const scope = pendingRef.current?.saveScope;
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

    if (resolveProjectConfirmDialogAction() === "delete") {
      await performDelete();
    }
  }, [
    dialogState.status,
    handleSave,
    handleSaveSiteSettings,
    isDirty,
    isSettingsDirty,
    performDelete,
    resolveProjectConfirmDialogAction,
    runPendingWorkflow
  ]);

  const secondaryDialogAction = useCallback(async () => {
    if (dialogState.status === "confirming") {
      await runPendingWorkflow();
    }
  }, [dialogState.status, runPendingWorkflow]);

  const selectProject = useCallback(
    (project: AdminProjectListItem) => {
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
    },
    [
      formState.title,
      isDirty,
      openWorkflowConfirmation,
      selectProjectImmediately,
      selectedProjectKey
    ]
  );

  const newProject = useCallback(() => {
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
  }, [isDirty, newProjectImmediately, openWorkflowConfirmation]);

  const handleResetClick = useCallback(() => {
    if (working) return;

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
  }, [
    activeTab,
    handleProjectResetClick,
    isSettingsDirty,
    openWorkflowConfirmation,
    resetSiteSettings,
    working
  ]);

  const handleSignOut = useCallback(() => {
    if (working) return;

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
  }, [
    handleSignOutImmediately,
    isDirty,
    isSettingsDirty,
    openWorkflowConfirmation,
    working
  ]);

  const handleKeyboardSave = useEffectEvent(() => {
    if (working) return;

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

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (isDirty || isSettingsDirty) event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty, isSettingsDirty]);

  const workflowConfirmDialog =
    dialogState.status === "confirming" ? dialogState.dialog : null;
  const confirmDialog = workflowConfirmDialog ?? projectConfirmDialog;

  return {
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
  };
}
