"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useForm } from "@/hooks/use-form";
import { findAdminProjectBySlug } from "@/lib/admin-project-repository";
import type {
  AdminConfirmDialogState,
  AdminProjectListItem,
  ProjectFormState,
  SlugValidationState
} from "@/lib/admin-types";
import {
  buildUniqueSlugSuggestion,
  createEmptyProject,
  getAdminProjectKey,
  getProjectCompletionIssues,
  parseMultilineInput,
  slugify,
  toFormState
} from "@/lib/admin-utils";

const DRAFT_PROJECT_KEY = "draft:new-project";
const IDLE_SLUG_VALIDATION: SlugValidationState = {
  status: "idle",
  slug: "",
  message: null,
  suggestedSlug: null
};

type UseAdminProjectWorkspaceOptions = {
  supabase: SupabaseClient | null;
  sessionEmail: string | null;
  projects: AdminProjectListItem[];
  templateProjects: AdminProjectListItem[];
  defaultTemplate: AdminProjectListItem;
  coverFile: File | null;
  galleryFiles: File[];
  videoFile: File | null;
  coverPreviewUrl: string | null;
  working: boolean;
  clearMedia(): void;
  clearSaveReport(): void;
  showStatus(message: string): void;
};

export function useAdminProjectWorkspace({
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
}: UseAdminProjectWorkspaceOptions) {
  const form = useForm<ProjectFormState>(toFormState(defaultTemplate));
  const [selectedProjectKey, setSelectedProjectKey] = useState(
    defaultTemplate.adminKey
  );
  const [savedFormSnapshot, setSavedFormSnapshot] = useState(() =>
    JSON.stringify(toFormState(defaultTemplate))
  );
  const [saveCount, setSaveCount] = useState(0);
  const [slugValidation, setSlugValidation] = useState<SlugValidationState>(
    IDLE_SLUG_VALIDATION
  );
  const [confirmDialog, setConfirmDialog] =
    useState<AdminConfirmDialogState | null>(null);
  const slugValidationRequest = useRef(0);

  const {
    values: formState,
    replace: replaceForm,
    updateField: updateFormField
  } = form;

  const allProjects = useMemo(
    () => [...templateProjects, ...projects],
    [projects, templateProjects]
  );
  const galleryImageList = parseMultilineInput(formState.galleryImagesText);
  const captionRawLines = formState.galleryCaptionsText.split("\n");
  const completionIssues = getProjectCompletionIssues(formState, {
    hasQueuedCover: Boolean(coverFile),
    queuedGalleryCount: galleryFiles.length
  });
  const isDirty =
    JSON.stringify(formState) !== savedFormSnapshot ||
    Boolean(coverFile) ||
    galleryFiles.length > 0 ||
    Boolean(videoFile);

  const resetSlugValidation = useCallback(() => {
    slugValidationRequest.current += 1;
    setSlugValidation(IDLE_SLUG_VALIDATION);
  }, []);

  const applyProject = useCallback(
    (project: AdminProjectListItem) => {
      const state = toFormState(project);
      setSelectedProjectKey(project.adminKey);
      replaceForm(state);
      setSavedFormSnapshot(JSON.stringify(state));
      clearSaveReport();
      clearMedia();
      setConfirmDialog(null);
      resetSlugValidation();
    },
    [clearMedia, clearSaveReport, replaceForm, resetSlugValidation]
  );

  const resetToNewProject = useCallback(() => {
    const fresh = createEmptyProject();
    setSelectedProjectKey(DRAFT_PROJECT_KEY);
    replaceForm(fresh);
    setSavedFormSnapshot(JSON.stringify(fresh));
    clearSaveReport();
    clearMedia();
    setConfirmDialog(null);
    resetSlugValidation();
  }, [clearMedia, clearSaveReport, replaceForm, resetSlugValidation]);

  const updateField = useCallback(
    <K extends keyof ProjectFormState>(
      key: K,
      value: ProjectFormState[K]
    ) => {
      clearSaveReport();
      if (key === "slug" || key === "title") {
        resetSlugValidation();
      }
      updateFormField(key, value);
    },
    [clearSaveReport, resetSlugValidation, updateFormField]
  );

  const updateCaption = useCallback(
    (index: number, value: string) => {
      const lines = formState.galleryCaptionsText.split("\n");
      while (lines.length <= index) lines.push("");
      lines[index] = value;
      updateField("galleryCaptionsText", lines.join("\n"));
    },
    [formState.galleryCaptionsText, updateField]
  );

  const selectProject = useCallback(
    (project: AdminProjectListItem) => {
      if (isDirty) showStatus("Previous unsaved changes were discarded.");
      applyProject(project);
      if (project.isTemplate) {
        showStatus(
          `${project.business} template loaded. Saving will create a new project and keep the template available.`
        );
      }
    },
    [applyProject, isDirty, showStatus]
  );

  const newProject = useCallback(() => {
    if (isDirty) showStatus("Previous unsaved changes were discarded.");
    resetToNewProject();
  }, [isDirty, resetToNewProject, showStatus]);

  const duplicateProject = useCallback(() => {
    const baseSlug = formState.slug.endsWith("-copy")
      ? formState.slug
      : `${formState.slug}-copy`;
    const copy: ProjectFormState = {
      ...formState,
      id: undefined,
      templateBusiness: undefined,
      title: `${formState.title} (Copy)`,
      slug: baseSlug,
      published: false,
      createdAt: new Date().toISOString()
    };

    setSelectedProjectKey(DRAFT_PROJECT_KEY);
    replaceForm(copy);
    setSavedFormSnapshot("");
    clearSaveReport();
    clearMedia();
    setConfirmDialog(null);
    resetSlugValidation();
    showStatus("Project duplicated. Update the title and slug, then save.");
  }, [
    clearMedia,
    clearSaveReport,
    formState,
    replaceForm,
    resetSlugValidation,
    showStatus
  ]);

  const checkSlugAvailability = useCallback(
    async (
      rawValue = formState.slug || formState.title,
      options?: { showAvailableState?: boolean }
    ) => {
      const targetSlug = slugify(rawValue);

      if (!targetSlug) {
        resetSlugValidation();
        return { ok: false as const, slug: "" };
      }

      const existingSlugs = projects
        .filter((project) => project.id !== formState.id)
        .map((project) => project.slug);
      const suggestion = buildUniqueSlugSuggestion(targetSlug, existingSlugs);
      const requestId = ++slugValidationRequest.current;

      setSlugValidation({
        status: "checking",
        slug: targetSlug,
        message: "Checking slug availability...",
        suggestedSlug: null
      });

      const localConflict = projects.find(
        (project) =>
          project.slug === targetSlug && project.id !== formState.id
      );

      if (localConflict) {
        if (requestId !== slugValidationRequest.current) {
          return { ok: false as const, slug: targetSlug };
        }

        setSlugValidation({
          status: "conflict",
          slug: targetSlug,
          message: `This slug is already used by "${localConflict.title}".`,
          suggestedSlug: suggestion
        });
        return {
          ok: false as const,
          slug: targetSlug,
          suggestedSlug: suggestion
        };
      }

      if (supabase && sessionEmail) {
        const lookupResult = await findAdminProjectBySlug(
          supabase,
          targetSlug,
          formState.id
        );

        if (requestId !== slugValidationRequest.current) {
          return { ok: false as const, slug: targetSlug };
        }

        if (!lookupResult.ok) {
          showStatus(
            `${lookupResult.error.message} It will be checked again when saving.`
          );
          resetSlugValidation();
          return { ok: false as const, slug: targetSlug };
        }

        if (lookupResult.data) {
          setSlugValidation({
            status: "conflict",
            slug: targetSlug,
            message: `This slug is already used by "${lookupResult.data.title}".`,
            suggestedSlug: suggestion
          });
          return {
            ok: false as const,
            slug: targetSlug,
            suggestedSlug: suggestion
          };
        }
      }

      setSlugValidation({
        status:
          options?.showAvailableState === false ? "idle" : "available",
        slug: targetSlug,
        message:
          options?.showAvailableState === false
            ? null
            : "Slug is available.",
        suggestedSlug: null
      });
      return { ok: true as const, slug: targetSlug };
    },
    [
      formState.id,
      formState.slug,
      formState.title,
      projects,
      resetSlugValidation,
      sessionEmail,
      showStatus,
      supabase
    ]
  );

  const handleSlugBlur = useCallback(() => {
    void checkSlugAvailability();
  }, [checkSlugAvailability]);

  const applySuggestedSlug = useCallback(() => {
    if (!slugValidation.suggestedSlug) return;
    updateField("slug", slugValidation.suggestedSlug);
    void checkSlugAvailability(slugValidation.suggestedSlug);
  }, [checkSlugAvailability, slugValidation.suggestedSlug, updateField]);

  const resetCurrentSelection = useCallback(() => {
    const current = allProjects.find(
      (project) => project.adminKey === selectedProjectKey
    );
    current ? applyProject(current) : resetToNewProject();
  }, [allProjects, applyProject, resetToNewProject, selectedProjectKey]);

  const handleResetClick = useCallback(() => {
    if (!isDirty) {
      resetCurrentSelection();
      return;
    }

    setConfirmDialog({
      action: "reset",
      title: "Discard unsaved changes?",
      description:
        "Resetting restores the last saved project state and removes any unsaved edits in the editor and preview.",
      confirmLabel: "Reset form",
      tone: "default",
      inputValue: ""
    });
  }, [isDirty, resetCurrentSelection]);

  const openDeleteDialog = useCallback(() => {
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

    setConfirmDialog({
      action: "delete",
      title: `Delete "${formState.title}"?`,
      description: formState.published
        ? "This published project will be removed from Supabase and disappear from the live website. This action cannot be undone."
        : "This project will be removed from Supabase. This action cannot be undone.",
      confirmLabel: "Delete project",
      tone: "danger",
      requireMatchText: formState.published ? formState.title : undefined,
      inputLabel: formState.published
        ? "Type the project title to confirm"
        : undefined,
      inputPlaceholder: formState.published ? formState.title : undefined,
      inputValue: ""
    });
  }, [
    formState.id,
    formState.published,
    formState.templateBusiness,
    formState.title,
    showStatus
  ]);

  const closeConfirmDialog = useCallback(() => {
    if (!working) setConfirmDialog(null);
  }, [working]);

  const updateConfirmDialogInput = useCallback((value: string) => {
    setConfirmDialog((current) =>
      current ? { ...current, inputValue: value } : current
    );
  }, []);

  const resolveConfirmDialogAction = useCallback((): "delete" | null => {
    if (!confirmDialog) return null;

    if (
      confirmDialog.requireMatchText &&
      confirmDialog.inputValue.trim() !== confirmDialog.requireMatchText
    ) {
      showStatus("Type the project title exactly to confirm deletion.");
      return null;
    }

    setConfirmDialog(null);
    if (confirmDialog.action === "reset") {
      resetCurrentSelection();
      showStatus("Unsaved changes were discarded.");
      return null;
    }

    return "delete";
  }, [confirmDialog, resetCurrentSelection, showStatus]);

  const restoreDraft = useCallback(
    (restoredDraft: ProjectFormState) => {
      replaceForm(restoredDraft);
      setSelectedProjectKey(
        restoredDraft.templateBusiness
          ? getAdminProjectKey({
              slug: restoredDraft.slug,
              isTemplate: true,
              templateBusiness: restoredDraft.templateBusiness
            })
          : DRAFT_PROJECT_KEY
      );
      setSavedFormSnapshot(JSON.stringify(restoredDraft));
      showStatus("Draft restored from browser storage.");
    },
    [replaceForm, showStatus]
  );

  const commitSavedProject = useCallback(
    (saved: AdminProjectListItem) => {
      const state = toFormState(saved);
      setSelectedProjectKey(saved.adminKey);
      replaceForm(state);
      setSavedFormSnapshot(JSON.stringify(state));
      setSaveCount((count) => count + 1);
      setConfirmDialog(null);
      resetSlugValidation();
    },
    [replaceForm, resetSlugValidation]
  );

  return {
    formState,
    selectedProjectKey,
    saveCount,
    galleryImageList,
    captionRawLines,
    completionIssues,
    isProjectComplete: completionIssues.length === 0,
    isDirty,
    isTemplateProject: Boolean(formState.templateBusiness),
    coverPreviewImage: coverPreviewUrl ?? formState.coverImage,
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
  };
}
