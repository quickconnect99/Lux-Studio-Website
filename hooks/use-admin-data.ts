"use client";

import {
  useCallback,
  useMemo,
  useEffect,
  useRef,
  useState
} from "react";
import { useAdminDraft } from "@/hooks/use-admin-draft";
import { useAdminMedia } from "@/hooks/use-admin-media";
import { useAdminSession } from "@/hooks/use-admin-session";
import { useAdminSiteSettings } from "@/hooks/use-admin-site-settings";
import { useForm } from "@/hooks/use-form";
import {
  buildLocalProject,
  buildProjectDatabasePayload,
  getProjectMediaState
} from "@/lib/admin-persistence";
import {
  buildLocalProjectSaveReport,
  buildRemoteProjectSaveReport
} from "@/lib/admin-save-report";
import {
  deleteAdminProjectRecord,
  loadAdminProjects,
  mergeAdminProjectList,
  removeAdminProjectFromList,
  saveAdminProjectRecord
} from "@/lib/admin-project-repository";
import {
  revalidateAdminPublicContent,
  uploadAdminFile
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
  AdminUploadProgress,
  ProjectFormState,
  SlugValidationState
} from "@/lib/admin-types";
import {
  buildUniqueSlugSuggestion,
  getAdminProjectKey,
  slugify,
  parseMultilineInput,
  getProjectCompletionIssues,
  projectTemplates,
  toAdminProjectListItem,
  toFormState,
  createEmptyProject
} from "@/lib/admin-utils";

const DRAFT_PROJECT_KEY = "draft:new-project";
const EMPTY_AUTH_FORM = { email: "", password: "" };
const DEFAULT_STATUS_MESSAGE =
  "Two starter templates are always available. Editing one and saving creates a new project.";

export function useAdminData() {
  const supabase = createBrowserSupabaseClient();
  const templateProjects = projectTemplates;
  const defaultTemplate = templateProjects[0];

  const projectForm = useForm<ProjectFormState>(toFormState(defaultTemplate));
  const authForm = useForm(EMPTY_AUTH_FORM);

  const [activeTab, setActiveTab] = useState<AdminTab>("projects");
  const [projects, setProjects] = useState<AdminProjectListItem[]>([]);
  const [selectedProjectKey, setSelectedProjectKey] = useState<string>(
    defaultTemplate.adminKey
  );
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState(DEFAULT_STATUS_MESSAGE);
  const [saveReport, setSaveReport] = useState<AdminSaveReport | null>(null);
  const [working, setWorking] = useState(false);
  const [uploadProgress, setUploadProgress] =
    useState<AdminUploadProgress | null>(null);
  const [savedFormSnapshot, setSavedFormSnapshot] = useState<string>(
    JSON.stringify(toFormState(defaultTemplate))
  );
  const [saveCount, setSaveCount] = useState(0);
  const [slugValidation, setSlugValidation] = useState<SlugValidationState>({
    status: "idle",
    slug: "",
    message: null,
    suggestedSlug: null
  });
  const [confirmDialog, setConfirmDialog] =
    useState<AdminConfirmDialogState | null>(null);
  const slugValidationRequest = useRef(0);
  const hasAppliedInitialProject = useRef(false);

  const {
    values: formState,
    replace: replaceProjectForm,
    updateField: updateProjectFormField
  } = projectForm;
  const {
    values: authFormState,
    updateField: updateAuthFormField,
    reset: resetAuthForm
  } = authForm;

  const galleryImageList = parseMultilineInput(formState.galleryImagesText);
  const captionRawLines = formState.galleryCaptionsText.split("\n");
  const isTemplateProject = Boolean(formState.templateBusiness);
  const allProjects = useMemo(
    () => [...templateProjects, ...projects],
    [projects, templateProjects]
  );

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

  const completionIssues = getProjectCompletionIssues(formState, {
    hasQueuedCover: Boolean(coverFile),
    queuedGalleryCount: galleryFiles.length
  });
  const isProjectComplete = completionIssues.length === 0;

  const isDirty =
    JSON.stringify(formState) !== savedFormSnapshot ||
    Boolean(coverFile) ||
    galleryFiles.length > 0 ||
    Boolean(videoFile);

  const coverPreviewImage = coverPreviewUrl ?? formState.coverImage;

  const restoreDraft = useCallback(
    (restoredDraft: ProjectFormState) => {
      replaceProjectForm(restoredDraft);
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
    [replaceProjectForm, showStatus]
  );

  const { clearDraft } = useAdminDraft({
    enabled: !isSupabaseConfigured,
    sessionEmail,
    formState,
    onRestore: restoreDraft
  });

  const updateField = useCallback(
    <K extends keyof ProjectFormState>(key: K, value: ProjectFormState[K]) => {
      setSaveReport(null);
      if (key === "slug" || key === "title") {
        setSlugValidation({
          status: "idle",
          slug: "",
          message: null,
          suggestedSlug: null
        });
      }
      updateProjectFormField(key, value);
    },
    [updateProjectFormField]
  );

  function updateCaption(index: number, value: string) {
    const lines = formState.galleryCaptionsText.split("\n");
    while (lines.length <= index) lines.push("");
    lines[index] = value;
    updateField("galleryCaptionsText", lines.join("\n"));
  }

  const applyProject = useCallback(
    (project: AdminProjectListItem) => {
      const state = toFormState(project);
      setSelectedProjectKey(project.adminKey);
      replaceProjectForm(state);
      setSavedFormSnapshot(JSON.stringify(state));
      setSaveReport(null);
      clearMedia();
      setConfirmDialog(null);
      setSlugValidation({
        status: "idle",
        slug: "",
        message: null,
        suggestedSlug: null
      });
    },
    [clearMedia, replaceProjectForm]
  );

  function resetToNewProject() {
    const fresh = createEmptyProject();
    setSelectedProjectKey(DRAFT_PROJECT_KEY);
    replaceProjectForm(fresh);
    setSavedFormSnapshot(JSON.stringify(fresh));
    setSaveReport(null);
    clearMedia();
    setConfirmDialog(null);
    setSlugValidation({
      status: "idle",
      slug: "",
      message: null,
      suggestedSlug: null
    });
  }

  function selectProject(project: AdminProjectListItem) {
    if (isDirty) showStatus("Previous unsaved changes were discarded.");
    applyProject(project);
    if (project.isTemplate) {
      showStatus(
        `${project.business} template loaded. Saving will create a new project and keep the template available.`
      );
    }
  }

  function newProject() {
    if (isDirty) showStatus("Previous unsaved changes were discarded.");
    resetToNewProject();
  }

  function duplicateProject() {
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
    replaceProjectForm(copy);
    setSavedFormSnapshot("");
    setSaveReport(null);
    clearMedia();
    setConfirmDialog(null);
    setSlugValidation({
      status: "idle",
      slug: "",
      message: null,
      suggestedSlug: null
    });
    showStatus("Project duplicated. Update the title and slug, then save.");
  }

  async function checkSlugAvailability(
    rawValue = formState.slug || formState.title,
    options?: { showAvailableState?: boolean }
  ) {
    const targetSlug = slugify(rawValue);

    if (!targetSlug) {
      setSlugValidation({
        status: "idle",
        slug: "",
        message: null,
        suggestedSlug: null
      });
      return { ok: false, slug: "" };
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
      (project) => project.slug === targetSlug && project.id !== formState.id
    );

    if (localConflict) {
      if (requestId !== slugValidationRequest.current) {
        return { ok: false, slug: targetSlug };
      }

      setSlugValidation({
        status: "conflict",
        slug: targetSlug,
        message: `This slug is already used by "${localConflict.title}".`,
        suggestedSlug: suggestion
      });
      return { ok: false, slug: targetSlug, suggestedSlug: suggestion };
    }

    if (supabase && sessionEmail) {
      let query = supabase
        .from("projects")
        .select("id, title, slug")
        .eq("slug", targetSlug);

      if (formState.id) {
        query = query.neq("id", formState.id);
      }

      const { data, error } = await query.maybeSingle();

      if (requestId !== slugValidationRequest.current) {
        return { ok: false, slug: targetSlug };
      }

      if (error) {
        showStatus(
          "Slug availability could not be verified against Supabase. It will be checked again when saving."
        );
        setSlugValidation({
          status: "idle",
          slug: targetSlug,
          message: null,
          suggestedSlug: null
        });
        return { ok: false, slug: targetSlug };
      }

      if (data) {
        setSlugValidation({
          status: "conflict",
          slug: targetSlug,
          message: `This slug is already used by "${data.title}".`,
          suggestedSlug: suggestion
        });
        return { ok: false, slug: targetSlug, suggestedSlug: suggestion };
      }
    }

    setSlugValidation({
      status: options?.showAvailableState === false ? "idle" : "available",
      slug: targetSlug,
      message:
        options?.showAvailableState === false ? null : "Slug is available.",
      suggestedSlug: null
    });
    return { ok: true, slug: targetSlug };
  }

  function handleSlugBlur() {
    void checkSlugAvailability();
  }

  function applySuggestedSlug() {
    if (!slugValidation.suggestedSlug) {
      return;
    }

    updateField("slug", slugValidation.suggestedSlug);
    void checkSlugAvailability(slugValidation.suggestedSlug);
  }

  function handleResetClick() {
    if (!isDirty) {
      const current = allProjects.find(
        (p) => p.adminKey === selectedProjectKey
      );
      current ? applyProject(current) : resetToNewProject();
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
  }

  function openDeleteDialog() {
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
  }

  function closeConfirmDialog() {
    if (working) {
      return;
    }

    setConfirmDialog(null);
  }

  function updateConfirmDialogInput(value: string) {
    setConfirmDialog((current) =>
      current ? { ...current, inputValue: value } : current
    );
  }

  function resetCurrentSelection() {
    const current = allProjects.find((p) => p.adminKey === selectedProjectKey);
    current ? applyProject(current) : resetToNewProject();
  }

  async function confirmDialogAction() {
    if (!confirmDialog) {
      return;
    }

    if (
      confirmDialog.requireMatchText &&
      confirmDialog.inputValue.trim() !== confirmDialog.requireMatchText
    ) {
      showStatus("Type the project title exactly to confirm deletion.");
      return;
    }

    if (confirmDialog.action === "reset") {
      setConfirmDialog(null);
      resetCurrentSelection();
      showStatus("Unsaved changes were discarded.");
      return;
    }

    setConfirmDialog(null);
    await performDelete();
  }

  const loadProjects = useCallback(async () => {
    if (!supabase) return;
    const normalized = await loadAdminProjects(supabase);

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
  }, [applyProject, defaultTemplate, supabase]);

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
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
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
      {
        showAvailableState: false
      }
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
      let galleryCaptions = formState.galleryCaptionsText
        .split("\n")
        .map((v) => v.trim());
      let shouldClearQueuedMedia = true;
      let nextReport: AdminSaveReport | null = null;

      if (supabase && sessionEmail) {
        const totalFiles =
          (coverFile ? 1 : 0) + (videoFile ? 1 : 0) + galleryFiles.length;
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
          for (const f of galleryFiles) {
            setUploadProgress({
              current: ++uploadedCount,
              total: totalFiles,
              filename: f.name
            });
            uploaded.push(await uploadAdminFile(supabase, f, "gallery"));
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

        const saved = await saveAdminProjectRecord(supabase, payload);
        const nextProjects = mergeAdminProjectList(projects, saved, {
          sortByCreatedAt: true
        });

        setProjects(nextProjects);
        const nextState = toFormState(saved);
        setSelectedProjectKey(saved.adminKey);
        replaceProjectForm(nextState);
        setSavedFormSnapshot(JSON.stringify(nextState));
        setSaveCount((c) => c + 1);
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

        const nextProjects = mergeAdminProjectList(projects, saved);
        setProjects(nextProjects);
        const nextState = toFormState(saved);
        setSelectedProjectKey(saved.adminKey);
        replaceProjectForm(nextState);
        setSavedFormSnapshot(JSON.stringify(nextState));
        setSaveCount((c) => c + 1);
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

      if (shouldClearQueuedMedia) {
        clearMedia();
      }

      setSaveReport(nextReport);
    } catch (err) {
      setUploadProgress(null);
      showStatus(
        err instanceof Error ? err.message : "The project could not be saved."
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
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty || isSettingsDirty) e.preventDefault();
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
        await deleteAdminProjectRecord(supabase, formState.id);
        void revalidateAdminPublicContent(supabase);
      }

      const next = removeAdminProjectFromList(projects, formState.id);
      setProjects(next);
      if (next[0]) {
        applyProject(next[0]);
      } else {
        applyProject(defaultTemplate);
      }
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
    } catch (err) {
      showStatus(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setWorking(false);
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
