"use client";

import {
  type ChangeEvent,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  useState
} from "react";
import { useForm } from "@/hooks/use-form";
import { defaultSiteSettings } from "@/lib/site-config";
import { normalizeProjectGallery } from "@/lib/project-images";
import {
  SITE_SETTINGS_ID,
  SUPABASE_BUCKET,
  createBrowserSupabaseClient,
  isSupabaseConfigured,
  normalizeSiteSettingsRecord,
  normalizeProjectRecord
} from "@/lib/supabase";
import type {
  AdminConfirmDialogState,
  AdminProjectListItem,
  AdminSaveReport,
  AdminTab,
  ProjectFormState,
  SlugValidationState,
  SiteSettingsFormState
} from "@/lib/admin-types";
import {
  buildUniqueSlugSuggestion,
  DRAFT_STORAGE_KEY,
  formatFileSize,
  getAdminProjectKey,
  slugify,
  parseMultilineInput,
  getProjectCompletionIssues,
  projectTemplates,
  toAdminProjectListItem,
  toFormState,
  toSiteSettingsFormState,
  parseSocialLinksText,
  parseValuesText,
  parseServicesText,
  createEmptyProject
} from "@/lib/admin-utils";

type UploadProgress = { current: number; total: number; filename: string };

const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
const MAX_VIDEO_BYTES = 2 * 1024 * 1024 * 1024;
const DRAFT_PROJECT_KEY = "draft:new-project";
const DEFAULT_STATUS_MESSAGE =
  "Two starter templates are always available. Editing one and saving creates a new project.";

export function useAdminData() {
  const supabase = createBrowserSupabaseClient();
  const templateProjects = projectTemplates;
  const defaultTemplate = templateProjects[0];

  const projectForm = useForm<ProjectFormState>(
    toFormState(defaultTemplate)
  );
  const siteSettingsForm = useForm<SiteSettingsFormState>(
    toSiteSettingsFormState(defaultSiteSettings)
  );
  const authForm = useForm({ email: "", password: "" });

  const [activeTab, setActiveTab] = useState<AdminTab>("projects");
  const [projects, setProjects] = useState<AdminProjectListItem[]>([]);
  const [selectedProjectKey, setSelectedProjectKey] = useState<string>(
    defaultTemplate.adminKey
  );
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState(DEFAULT_STATUS_MESSAGE);
  const [saveReport, setSaveReport] = useState<AdminSaveReport | null>(null);
  const [working, setWorking] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null
  );
  const [coverFile, setCoverFileState] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [videoFile, setVideoFileState] = useState<File | null>(null);
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

  const {
    values: formState,
    replace: replaceProjectForm,
    updateField: updateProjectFormField
  } = projectForm;
  const {
    values: siteSettingsFormState,
    replace: replaceSiteSettingsForm,
    updateField: updateSiteSettingsFormField
  } = siteSettingsForm;
  const {
    values: authFormState,
    updateField: updateAuthFormField,
    reset: resetAuthForm
  } = authForm;

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

  const galleryImageList = parseMultilineInput(formState.galleryImagesText);
  const captionRawLines = formState.galleryCaptionsText.split("\n");
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!coverFile) {
      setCoverPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(coverFile);
    setCoverPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [coverFile]);

  const coverPreviewImage = coverPreviewUrl ?? formState.coverImage;
  const isTemplateProject = Boolean(formState.templateBusiness);
  const allProjects = useMemo(
    () => [...templateProjects, ...projects],
    [projects, templateProjects]
  );

  const showStatus = useCallback((message: string) => {
    setSaveReport(null);
    setStatusMessage(message);
  }, []);

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

  const updateSiteSettingsField = useCallback(
    <K extends keyof SiteSettingsFormState>(
      key: K,
      value: SiteSettingsFormState[K]
    ) => {
      setSaveReport(null);
      updateSiteSettingsFormField(key, value);
    },
    [updateSiteSettingsFormField]
  );

  const setCoverFile = useCallback((file: File | null) => {
    setSaveReport(null);
    setCoverFileState(file);
  }, []);

  const setVideoFile = useCallback((file: File | null) => {
    setSaveReport(null);
    setVideoFileState(file);
  }, []);

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
      setCoverFileState(null);
      setGalleryFiles([]);
      setVideoFileState(null);
      setConfirmDialog(null);
      setSlugValidation({
        status: "idle",
        slug: "",
        message: null,
        suggestedSlug: null
      });
    },
    [replaceProjectForm]
  );

  function resetToNewProject() {
    const fresh = createEmptyProject();
    setSelectedProjectKey(DRAFT_PROJECT_KEY);
    replaceProjectForm(fresh);
    setSavedFormSnapshot(JSON.stringify(fresh));
    setSaveReport(null);
    setCoverFileState(null);
    setGalleryFiles([]);
    setVideoFileState(null);
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
    setCoverFileState(null);
    setGalleryFiles([]);
    setVideoFileState(null);
    setConfirmDialog(null);
    setSlugValidation({
      status: "idle",
      slug: "",
      message: null,
      suggestedSlug: null
    });
    showStatus("Project duplicated. Update the title and slug, then save.");
  }

  function addGalleryFiles(newFiles: File[]) {
    const oversized = newFiles.filter((f) => f.size > MAX_IMAGE_BYTES);
    if (oversized.length > 0) {
      showStatus(
        `Files too large: ${oversized.map((f) => f.name).join(", ")}. Maximum 25 MB per image.`
      );
      return;
    }
    setSaveReport(null);
    setGalleryFiles((prev) => [...prev, ...newFiles]);
  }

  function removeGalleryFile(index: number) {
    setSaveReport(null);
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
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
      status:
        options?.showAvailableState === false ? "idle" : "available",
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
      const current = allProjects.find((p) => p.adminKey === selectedProjectKey);
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
      showStatus("Templates are permanent starting points and cannot be deleted.");
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
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (!data || data.length === 0) {
      setProjects([]);
      return;
    }

    const normalized = data
      .map((item) => normalizeProjectRecord(item))
      .map(toAdminProjectListItem);
    setProjects(normalized);
  }, [supabase]);

  const loadSiteSettings = useCallback(async () => {
    if (!supabase) {
      replaceSiteSettingsForm(toSiteSettingsFormState(defaultSiteSettings));
      return;
    }
    const { data } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", SITE_SETTINGS_ID)
      .maybeSingle();
    if (!data) {
      replaceSiteSettingsForm(toSiteSettingsFormState(defaultSiteSettings));
      return;
    }
    replaceSiteSettingsForm(
      toSiteSettingsFormState(normalizeSiteSettingsRecord(data))
    );
  }, [supabase, replaceSiteSettingsForm]);

  useEffect(() => {
    if (!supabase) return;
    const supabaseClient = supabase;
    let active = true;

    async function bootstrap() {
      await loadSiteSettings();
      const {
        data: { session }
      } = await supabaseClient.auth.getSession();
      if (!active) return;
      setSessionEmail(session?.user.email ?? null);
      if (session?.user.email) await loadProjects();
    }

    void bootstrap();

    const {
      data: { subscription }
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setSessionEmail(session?.user.email ?? null);
      if (session?.user.email) {
        void loadProjects();
      } else {
        setProjects([]);
        void loadSiteSettings();
        applyProject(defaultTemplate);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadProjects, loadSiteSettings, applyProject, supabase, defaultTemplate]);

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

  useEffect(() => {
    if (isSupabaseConfigured) return;
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as Partial<ProjectFormState>;
      const restoredDraft: ProjectFormState = {
        ...createEmptyProject(),
        ...draft,
        business: draft.business === "Hospitality" ? "Hospitality" : "Car"
      };
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
    } catch {
      // ignore malformed storage
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (sessionEmail) return;
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formState));
    } catch {
      // ignore storage errors
    }
  }, [formState, sessionEmail]);

  async function uploadFile(file: File, folder: string): Promise<string> {
    if (!supabase) throw new Error("Supabase is not configured.");
    const filePath = `${folder}/${Date.now()}-${slugify(file.name)}`;
    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(filePath, file, { upsert: true });
    if (error) throw error;
    const {
      data: { publicUrl }
    } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(filePath);
    return publicUrl;
  }

  async function handleSave(event?: { preventDefault(): void }) {
    event?.preventDefault();

    if (!isProjectComplete) {
      showStatus(
        `Project not saved. Complete these fields first: ${completionIssues.join(", ")}.`
      );
      return;
    }

    const slugResult = await checkSlugAvailability(formState.slug || formState.title, {
      showAvailableState: false
    });
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
          coverImage = await uploadFile(coverFile, "covers");
        }
        if (videoFile) {
          setUploadProgress({
            current: ++uploadedCount,
            total: totalFiles,
            filename: videoFile.name
          });
          uploadedVideo = await uploadFile(videoFile, "videos");
        }
        if (galleryFiles.length > 0) {
          const uploaded: string[] = [];
          for (const f of galleryFiles) {
            setUploadProgress({
              current: ++uploadedCount,
              total: totalFiles,
              filename: f.name
            });
            uploaded.push(await uploadFile(f, "gallery"));
          }
          galleryImages = [...galleryImages, ...uploaded];
        }
        setUploadProgress(null);

        const normalizedGallery = normalizeProjectGallery({
          coverImage,
          galleryImages,
          galleryCaptions
        });
        galleryImages = normalizedGallery.images;
        galleryCaptions = normalizedGallery.captions;

        const createdAt = isTemplateSource
          ? new Date().toISOString()
          : formState.createdAt;
        const payload = {
          id: isTemplateSource ? undefined : formState.id,
          business: formState.business,
          title: formState.title,
          slug: targetSlug,
          short_description: formState.shortDescription,
          full_description: formState.fullDescription,
          category: formState.category,
          car_model: formState.carModel,
          location: formState.location,
          year: Number(formState.year),
          cover_image: coverImage,
          gallery_images: galleryImages,
          gallery_captions: galleryCaptions,
          video_url: formState.videoUrl || null,
          uploaded_video: uploadedVideo || null,
          featured: formState.featured,
          published: formState.published,
          created_at: createdAt,
          behind_the_scenes: formState.behindTheScenes || null
        };

        const { data, error } = await supabase
          .from("projects")
          .upsert(payload, { onConflict: "slug" })
          .select("*")
          .single();

        if (error) throw error;

        const saved = toAdminProjectListItem(normalizeProjectRecord(data));
        const nextProjects = [
          saved,
          ...projects.filter(
            (p) => p.id !== saved.id && p.slug !== saved.slug
          )
        ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

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
        nextReport = {
          title: isTemplateSource
            ? "New project created and synced"
            : "Project saved to Supabase",
          items: [
            {
              id: "project",
              label: "Project data saved",
              detail: "Supabase",
              tone: "success"
            },
            ...(coverFile
              ? [
                  {
                    id: "cover",
                    label: "Cover uploaded",
                    detail: formatFileSize(coverFile.size),
                    tone: "success" as const
                  }
                ]
              : []),
            ...(galleryFiles.length > 0
              ? [
                  {
                    id: "gallery",
                    label: `${galleryFiles.length} gallery ${galleryFiles.length === 1 ? "image" : "images"} uploaded`,
                    detail: formatFileSize(
                      galleryFiles.reduce((sum, file) => sum + file.size, 0)
                    ),
                    tone: "success" as const
                  }
                ]
              : []),
            ...(videoFile
              ? [
                  {
                    id: "video",
                    label: "Video uploaded",
                    detail: formatFileSize(videoFile.size),
                    tone: "success" as const
                  }
                ]
              : []),
            ...(!coverFile && galleryFiles.length === 0 && !videoFile
              ? [
                  {
                    id: "metadata-only",
                    label: "No media uploads in this save",
                    detail: "Metadata only",
                    tone: "info" as const
                  }
                ]
              : [])
          ]
        };
      } else {
        const normalizedGallery = normalizeProjectGallery({
          coverImage,
          galleryImages,
          galleryCaptions
        });
        galleryImages = normalizedGallery.images;
        galleryCaptions = normalizedGallery.captions;

        const createdAt = isTemplateSource
          ? new Date().toISOString()
          : formState.createdAt;
        const saved = toAdminProjectListItem({
          id: isTemplateSource ? undefined : formState.id,
          business: formState.business,
          title: formState.title,
          slug: targetSlug,
          shortDescription: formState.shortDescription,
          fullDescription: formState.fullDescription,
          category: formState.category,
          carModel: formState.carModel,
          location: formState.location,
          year: Number(formState.year),
          coverImage,
          galleryImages,
          galleryCaptions,
          videoUrl: formState.videoUrl || undefined,
          uploadedVideo: uploadedVideo || undefined,
          featured: formState.featured,
          published: formState.published,
          createdAt,
          behindTheScenes: formState.behindTheScenes || undefined
        });

        const nextProjects = [
          saved,
          ...projects.filter(
            (p) => p.id !== saved.id && p.slug !== saved.slug
          )
        ];
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
        nextReport = {
          title: isSupabaseConfigured
            ? "Saved locally only"
            : "Local draft saved",
          items: [
            {
              id: "project",
              label: isSupabaseConfigured
                ? "Project data saved in this browser session"
                : "Project data saved in browser storage",
              detail: isSupabaseConfigured ? "Session only" : "localStorage",
              tone: "info"
            },
            ...(coverFile
              ? [
                  {
                    id: "cover-warning",
                    label: "Cover upload still pending",
                    detail: "Sign in to Supabase to persist this file",
                    tone: "warning" as const
                  }
                ]
              : []),
            ...(galleryFiles.length > 0
              ? [
                  {
                    id: "gallery-warning",
                    label: `${galleryFiles.length} gallery ${galleryFiles.length === 1 ? "image is" : "images are"} still pending`,
                    detail: "Sign in to Supabase to upload queued media",
                    tone: "warning" as const
                  }
                ]
              : []),
            ...(videoFile
              ? [
                  {
                    id: "video-warning",
                    label: "Video upload still pending",
                    detail: "Sign in to Supabase to persist this file",
                    tone: "warning" as const
                  }
                ]
              : [])
          ]
        };
      }

      if (shouldClearQueuedMedia) {
        setCoverFileState(null);
        setGalleryFiles([]);
        setVideoFileState(null);
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
      if (isDirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  async function performDelete() {
    if (formState.templateBusiness) {
      showStatus("Templates are permanent starting points and cannot be deleted.");
      return;
    }

    if (!formState.id) {
      showStatus(
        "This project has no database ID and cannot be deleted."
      );
      return;
    }

    setSaveReport(null);
    setWorking(true);

    try {
      if (supabase && sessionEmail) {
        const { error } = await supabase
          .from("projects")
          .delete()
          .eq("id", formState.id);
        if (error) throw error;
      }

      const next = projects.filter((p) => p.id !== formState.id);
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

  async function handleSaveSiteSettings(event: { preventDefault(): void }) {
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

      const payload = {
        id: SITE_SETTINGS_ID,
        brand_name: siteSettingsFormState.brandName,
        brand_mark: siteSettingsFormState.brandMark,
        brand_strapline: siteSettingsFormState.brandStrapline,
        contact_email: siteSettingsFormState.contactEmail,
        contact_phone: siteSettingsFormState.contactPhone,
        contact_city: siteSettingsFormState.contactCity,
        social_links: parseSocialLinksText(
          siteSettingsFormState.socialLinksText
        ),
        seo_title: siteSettingsFormState.seoTitle,
        seo_description: siteSettingsFormState.seoDescription,
        seo_og_image: siteSettingsFormState.seoOgImage,
        hero_eyebrow: siteSettingsFormState.heroEyebrow,
        hero_headline_lead: siteSettingsFormState.heroHeadlineLead,
        hero_headline_trail: siteSettingsFormState.heroHeadlineTrail,
        hero_copy: siteSettingsFormState.heroCopy,
        hero_video_url: siteSettingsFormState.heroVideoUrl,
        about_founder_note: siteSettingsFormState.aboutFounderNote,
        about_positioning: siteSettingsFormState.aboutPositioning,
        about_values: parseValuesText(siteSettingsFormState.aboutValuesText),
        services: parseServicesText(siteSettingsFormState.servicesText)
      };

      const { data, error } = await supabase
        .from("site_settings")
        .upsert(payload, { onConflict: "id" })
        .select("*")
        .single();

      if (error) throw error;

      replaceSiteSettingsForm(
        toSiteSettingsFormState(normalizeSiteSettingsRecord(data))
      );
      setStatusMessage("Global site settings saved to Supabase.");
      setSaveReport({
        title: "Site settings saved",
        items: [
          {
            id: "site-settings",
            label: "Global site settings saved",
            detail: "Supabase",
            tone: "success"
          }
        ]
      });
    } catch (err) {
      showStatus(
        err instanceof Error
          ? err.message
          : "The site settings could not be saved."
      );
    } finally {
      setWorking(false);
    }
  }

  async function handleSignIn() {
    if (!supabase) return;
    setSaveReport(null);
    setWorking(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: authFormState.email,
        password: authFormState.password
      });
      if (error) throw error;
      showStatus("Signed in. Project syncing is now enabled.");
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        /* ignore */
      }
      resetAuthForm();
    } catch (err) {
      showStatus(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setWorking(false);
    }
  }

  async function handleSignOut() {
    if (!supabase) return;
    setSaveReport(null);
    await supabase.auth.signOut();
    setSessionEmail(null);
    setProjects([]);
    applyProject(defaultTemplate);
    showStatus("Signed out. Templates remain available for new project drafts.");
  }

  function handleFileSelection(
    event: ChangeEvent<HTMLInputElement>,
    type: "cover" | "video"
  ) {
    const files = Array.from(event.target.files ?? []);
    const limit = type === "video" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    const limitLabel = type === "video" ? "2 GB" : "25 MB";

    const oversized = files.filter((f) => f.size > limit);
    if (oversized.length > 0) {
      showStatus(
        `File too large: ${oversized.map((f) => f.name).join(", ")}. Maximum size for ${type === "video" ? "videos" : "images"} is ${limitLabel}.`
      );
      event.target.value = "";
      return;
    }

    setSaveReport(null);
    if (type === "cover") setCoverFile(files[0] ?? null);
    if (type === "video") setVideoFile(files[0] ?? null);
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
    updateSiteSettingsField,
    handleSaveSiteSettings
  };
}
