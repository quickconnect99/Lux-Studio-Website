"use client";

import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import { useForm } from "@/hooks/use-form";
import { projects as fallbackProjects } from "@/lib/content";
import { defaultSiteSettings } from "@/lib/site-config";
import {
  SITE_SETTINGS_ID,
  SUPABASE_BUCKET,
  createBrowserSupabaseClient,
  isSupabaseConfigured,
  normalizeSiteSettingsRecord,
  normalizeProjectRecord
} from "@/lib/supabase";
import type { Project } from "@/lib/types";
import type {
  AdminTab,
  ProjectFormState,
  SiteSettingsFormState
} from "@/lib/admin-types";
import {
  DRAFT_STORAGE_KEY,
  slugify,
  parseMultilineInput,
  getProjectCompletionIssues,
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

export function useAdminData() {
  const supabase = createBrowserSupabaseClient();

  const projectForm = useForm<ProjectFormState>(
    toFormState(fallbackProjects[0])
  );
  const siteSettingsForm = useForm<SiteSettingsFormState>(
    toSiteSettingsFormState(defaultSiteSettings)
  );
  const authForm = useForm({ email: "", password: "" });

  const [activeTab, setActiveTab] = useState<AdminTab>("projects");
  const [projects, setProjects] = useState<Project[]>(fallbackProjects);
  const [selectedSlug, setSelectedSlug] = useState<string>(
    fallbackProjects[0]?.slug ?? "new-project"
  );
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState(
    "Demo content is editable locally. Connect Supabase to persist projects and site settings."
  );
  const [working, setWorking] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null
  );
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [savedFormSnapshot, setSavedFormSnapshot] = useState<string>(
    JSON.stringify(toFormState(fallbackProjects[0]))
  );
  const [saveCount, setSaveCount] = useState(0);
  const [deleteConfirmPending, setDeleteConfirmPending] = useState(false);
  const [resetConfirmPending, setResetConfirmPending] = useState(false);
  const deleteConfirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetConfirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    values: formState,
    replace: replaceProjectForm,
    updateField
  } = projectForm;
  const {
    values: siteSettingsFormState,
    replace: replaceSiteSettingsForm,
    updateField: updateSiteSettingsField
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

  function updateCaption(index: number, value: string) {
    const lines = formState.galleryCaptionsText.split("\n");
    while (lines.length <= index) lines.push("");
    lines[index] = value;
    updateField("galleryCaptionsText", lines.join("\n"));
  }

  const applyProject = useCallback(
    (project: Project) => {
      const state = toFormState(project);
      setSelectedSlug(project.slug);
      replaceProjectForm(state);
      setSavedFormSnapshot(JSON.stringify(state));
      setCoverFile(null);
      setGalleryFiles([]);
      setVideoFile(null);
      setDeleteConfirmPending(false);
      setResetConfirmPending(false);
    },
    [replaceProjectForm]
  );

  function resetToNewProject() {
    const fresh = createEmptyProject();
    setSelectedSlug(fresh.slug);
    replaceProjectForm(fresh);
    setSavedFormSnapshot(JSON.stringify(fresh));
    setCoverFile(null);
    setGalleryFiles([]);
    setVideoFile(null);
    setDeleteConfirmPending(false);
    setResetConfirmPending(false);
  }

  function selectProject(project: Project) {
    if (isDirty) setStatusMessage("Previous unsaved changes were discarded.");
    applyProject(project);
  }

  function newProject() {
    if (isDirty) setStatusMessage("Previous unsaved changes were discarded.");
    resetToNewProject();
  }

  function duplicateProject() {
    const baseSlug = formState.slug.endsWith("-copy")
      ? formState.slug
      : `${formState.slug}-copy`;
    const copy: ProjectFormState = {
      ...formState,
      id: undefined,
      title: `${formState.title} (Copy)`,
      slug: baseSlug,
      published: false,
      createdAt: new Date().toISOString()
    };
    setSelectedSlug(copy.slug);
    replaceProjectForm(copy);
    setSavedFormSnapshot("");
    setCoverFile(null);
    setGalleryFiles([]);
    setVideoFile(null);
    setDeleteConfirmPending(false);
    setResetConfirmPending(false);
    setStatusMessage("Project duplicated. Update the title and slug, then save.");
  }

  function addGalleryFiles(newFiles: File[]) {
    const oversized = newFiles.filter((f) => f.size > MAX_IMAGE_BYTES);
    if (oversized.length > 0) {
      setStatusMessage(
        `Files too large: ${oversized.map((f) => f.name).join(", ")}. Maximum 25 MB per image.`
      );
      return;
    }
    setGalleryFiles((prev) => [...prev, ...newFiles]);
  }

  function removeGalleryFile(index: number) {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleResetClick() {
    if (!isDirty) {
      const current = projects.find((p) => p.slug === selectedSlug);
      current ? applyProject(current) : resetToNewProject();
      return;
    }

    if (!resetConfirmPending) {
      setResetConfirmPending(true);
      resetConfirmTimer.current = setTimeout(
        () => setResetConfirmPending(false),
        3000
      );
      return;
    }

    if (resetConfirmTimer.current) clearTimeout(resetConfirmTimer.current);
    setResetConfirmPending(false);
    const current = projects.find((p) => p.slug === selectedSlug);
    current ? applyProject(current) : resetToNewProject();
  }

  const loadProjects = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (!data || data.length === 0) return;
    const normalized = data.map((item) => normalizeProjectRecord(item));
    setProjects(normalized);
    if (normalized[0]) applyProject(normalized[0]);
  }, [supabase, applyProject]);

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
        setProjects(fallbackProjects);
        void loadSiteSettings();
        if (fallbackProjects[0]) applyProject(fallbackProjects[0]);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadProjects, loadSiteSettings, applyProject, supabase]);

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
      replaceProjectForm({
        ...createEmptyProject(),
        ...draft,
        business: draft.business === "Hospitality" ? "Hospitality" : "Car"
      });
      setStatusMessage("Draft restored from browser storage.");
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
      setStatusMessage(
        `Project not saved. Complete these fields first: ${completionIssues.join(", ")}.`
      );
      return;
    }

    const targetSlug = slugify(formState.slug || formState.title);
    const slugConflict = projects.find(
      (p) => p.slug === targetSlug && p.id !== formState.id
    );
    if (slugConflict) {
      setStatusMessage(
        `Slug "${targetSlug}" is already used by "${slugConflict.title}". Please choose a different title or slug.`
      );
      return;
    }

    setWorking(true);

    try {
      let coverImage = formState.coverImage;
      let uploadedVideo = formState.uploadedVideo;
      let galleryImages = parseMultilineInput(formState.galleryImagesText);
      const galleryCaptions = formState.galleryCaptionsText
        .split("\n")
        .map((v) => v.trim());

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

        const payload = {
          id: formState.id,
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
          created_at: formState.createdAt,
          behind_the_scenes: formState.behindTheScenes || null
        };

        const { data, error } = await supabase
          .from("projects")
          .upsert(payload, { onConflict: "slug" })
          .select("*")
          .single();

        if (error) throw error;

        const saved = normalizeProjectRecord(data);
        const nextProjects = [
          saved,
          ...projects.filter((p) => p.slug !== saved.slug)
        ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

        setProjects(nextProjects);
        const nextState = toFormState(saved);
        setSelectedSlug(saved.slug);
        replaceProjectForm(nextState);
        setSavedFormSnapshot(JSON.stringify(nextState));
        setSaveCount((c) => c + 1);
        setStatusMessage("Project saved to Supabase.");
      } else {
        const saved: Project = {
          id: formState.id,
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
          createdAt: formState.createdAt,
          behindTheScenes: formState.behindTheScenes || undefined
        };

        const nextProjects = [
          saved,
          ...projects.filter((p) => p.slug !== saved.slug)
        ];
        setProjects(nextProjects);
        const nextState = toFormState(saved);
        setSelectedSlug(saved.slug);
        replaceProjectForm(nextState);
        setSavedFormSnapshot(JSON.stringify(nextState));
        setSaveCount((c) => c + 1);
        setStatusMessage(
          isSupabaseConfigured
            ? "Sign in to persist changes to Supabase."
            : "Draft saved to browser storage."
        );
      }

      setCoverFile(null);
      setGalleryFiles([]);
      setVideoFile(null);
    } catch (err) {
      setUploadProgress(null);
      setStatusMessage(
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

  async function handleDeleteClick() {
    if (!formState.id) {
      setStatusMessage(
        "This project has no database ID and cannot be deleted."
      );
      return;
    }

    if (!deleteConfirmPending) {
      setDeleteConfirmPending(true);
      deleteConfirmTimer.current = setTimeout(
        () => setDeleteConfirmPending(false),
        3000
      );
      return;
    }

    if (deleteConfirmTimer.current) clearTimeout(deleteConfirmTimer.current);
    setDeleteConfirmPending(false);
    setWorking(true);

    try {
      if (supabase && sessionEmail) {
        const { error } = await supabase
          .from("projects")
          .delete()
          .eq("id", formState.id);
        if (error) throw error;
      }

      const next = projects.filter((p) => p.slug !== formState.slug);
      const remaining = next.length > 0 ? next : fallbackProjects;
      setProjects(remaining);
      if (remaining[0]) {
        applyProject(remaining[0]);
      } else {
        resetToNewProject();
      }
      setStatusMessage(
        sessionEmail
          ? "Project deleted from Supabase."
          : "Project removed from session."
      );
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setWorking(false);
    }
  }

  async function handleSaveSiteSettings(event: { preventDefault(): void }) {
    event.preventDefault();
    setWorking(true);

    try {
      if (!supabase) {
        setStatusMessage(
          "Connect Supabase to persist global links and contact details. Static fallback still lives in lib/site-config.ts."
        );
        return;
      }
      if (!sessionEmail) {
        setStatusMessage("Sign in to save global site settings.");
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
    } catch (err) {
      setStatusMessage(
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
    setWorking(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: authFormState.email,
        password: authFormState.password
      });
      if (error) throw error;
      setStatusMessage("Signed in. Project syncing is now enabled.");
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        /* ignore */
      }
      resetAuthForm();
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setWorking(false);
    }
  }

  async function handleSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSessionEmail(null);
    setStatusMessage("Signed out. Admin remains available in demo mode.");
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
      setStatusMessage(
        `File too large: ${oversized.map((f) => f.name).join(", ")}. Maximum size for ${type === "video" ? "videos" : "images"} is ${limitLabel}.`
      );
      event.target.value = "";
      return;
    }

    if (type === "cover") setCoverFile(files[0] ?? null);
    if (type === "video") setVideoFile(files[0] ?? null);
  }

  return {
    activeTab,
    setActiveTab,
    projects,
    selectedSlug,
    saveCount,
    sessionEmail,
    authFormState,
    updateAuthFormField,
    handleSignIn,
    handleSignOut,
    statusMessage,
    working,
    uploadProgress,
    coverFile,
    setCoverFile,
    galleryFiles,
    videoFile,
    setVideoFile,
    formState,
    updateField,
    completionIssues,
    isProjectComplete,
    isDirty,
    galleryImageList,
    captionRawLines,
    deleteConfirmPending,
    resetConfirmPending,
    updateCaption,
    handleFileSelection,
    addGalleryFiles,
    removeGalleryFile,
    handleSave,
    handleDeleteClick,
    handleResetClick,
    selectProject,
    newProject,
    duplicateProject,
    siteSettingsFormState,
    updateSiteSettingsField,
    handleSaveSiteSettings
  };
}
