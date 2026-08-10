"use client";

import { useDeferredValue, useState } from "react";
import dynamic from "next/dynamic";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FolderOpen,
  Info,
  Lock,
  LogIn,
  LogOut,
  Mail,
  Monitor,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  RefreshCw,
  Settings,
  UserRound,
  Users
} from "lucide-react";
import { AdminThemeChip } from "@/components/admin/admin-theme-chip";
import { AdminErrorBoundary } from "@/components/admin/admin-error-boundary";
import { ResilientImage } from "@/components/ui/resilient-image";
import { isSupabaseConfigured, SUPABASE_BUCKET } from "@/lib/supabase";
import { useAdminData } from "@/hooks/use-admin-data";
import { AdminConfirmModal } from "@/components/admin/admin-confirm-modal";
import { ProjectSidebar } from "@/components/admin/project-sidebar";
import type {
  PreviewEditableField,
  PreviewToggleField
} from "@/components/admin/live-preview";
import { slugify } from "@/lib/admin-utils";
import type { AdminProjectFieldKey } from "@/lib/admin-types";

function AdminModuleLoading({ label }: { label: string }) {
  return (
    <div
      className="panel-2xl admin-theme-surface min-h-64 animate-pulse p-6"
      role="status"
      aria-live="polite"
    >
      <span className="text-xs uppercase tracking-eyebrow text-muted">
        Loading {label}…
      </span>
    </div>
  );
}

const ProjectEditor = dynamic(
  () =>
    import("@/components/admin/project-editor").then(
      (module) => module.ProjectEditor
    ),
  {
    ssr: false,
    loading: () => <AdminModuleLoading label="project editor" />
  }
);

const LivePreview = dynamic(
  () =>
    import("@/components/admin/live-preview").then(
      (module) => module.LivePreview
    ),
  {
    ssr: false,
    loading: () => <AdminModuleLoading label="live preview" />
  }
);

const SiteSettingsForm = dynamic(
  () =>
    import("@/components/admin/site-settings-form").then(
      (module) => module.SiteSettingsForm
    ),
  {
    ssr: false,
    loading: () => <AdminModuleLoading label="site settings" />
  }
);

const AdminUsersPanel = dynamic(
  () =>
    import("@/components/admin/admin-users-panel").then(
      (module) => module.AdminUsersPanel
    ),
  {
    ssr: false,
    loading: () => <AdminModuleLoading label="admin access" />
  }
);

const AdminEmailSettingsPanel = dynamic(
  () =>
    import("@/components/admin/admin-email-settings-panel").then(
      (module) => module.AdminEmailSettingsPanel
    ),
  {
    ssr: false,
    loading: () => <AdminModuleLoading label="email settings" />
  }
);

/**
 * Top-level render layer for the admin workspace.
 *
 * `useAdminData` owns business state and persistence. This component chooses
 * the active editor/preview layout, distributes that state to child
 * components, and keeps responsive navigation concerns local to the UI.
 * Heavy editor modules are loaded dynamically so the login shell stays small.
 */
export function AdminDashboard() {
  const data = useAdminData();
  const [activeField, setActiveField] = useState<AdminProjectFieldKey | null>(
    null
  );
  const [isProjectSidebarVisible, setIsProjectSidebarVisible] = useState(true);
  const [workspaceView, setWorkspaceView] = useState<
    "projects" | "edit" | "preview"
  >("edit");

  const {
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
    handleDeleteClick,
    handleResetClick,
    selectProject,
    newProject,
    duplicateProject,
    siteSettingsFormState,
    isSettingsDirty,
    updateSiteSettingsField,
    handleSaveSiteSettings
  } = data;

  const liveProjectHref =
    formState.id && formState.published ? `/work/${formState.slug}` : null;
  const canEditCms = !isSupabaseConfigured || Boolean(sessionEmail);
  const deferredPreviewFormState = useDeferredValue(formState);
  const deferredPreviewGallery = useDeferredValue(galleryImageList);
  const deferredPreviewCaptions = useDeferredValue(captionRawLines);
  const deferredCoverPreview = useDeferredValue(coverPreviewImage);

  function renderSaveReportIcon(tone: "success" | "warning" | "info") {
    if (tone === "success") {
      return <CheckCircle2 className="h-4 w-4 text-success-text" />;
    }

    if (tone === "warning") {
      return <AlertTriangle className="h-4 w-4 text-warning-text" />;
    }

    return <Info className="h-4 w-4 text-accent-text" />;
  }

  function handlePreviewFieldUpdate(
    field: PreviewEditableField,
    value: string
  ) {
    switch (field) {
      case "business":
        updateField("business", value as typeof formState.business);
        break;
      case "title":
        updateField("title", value);
        updateField("slug", slugify(value));
        break;
      case "category":
        updateField("category", value);
        break;
      case "slug":
        updateField("slug", slugify(value));
        break;
      case "shortDescription":
        updateField("shortDescription", value);
        break;
      case "fullDescription":
        updateField("fullDescription", value);
        break;
      case "carModel":
        updateField("carModel", value);
        break;
      case "location":
        updateField("location", value);
        break;
      case "year":
        updateField("year", value);
        break;
      case "behindTheScenes":
        updateField("behindTheScenes", value);
        break;
      case "coverImage":
        setCoverFile(null);
        updateField("coverImage", value);
        break;
      case "videoUrl":
        updateField("videoUrl", value);
        if (value) {
          updateField("uploadedVideo", "");
          setVideoFile(null);
        }
        break;
      case "uploadedVideo":
        updateField("uploadedVideo", value);
        if (value) updateField("videoUrl", "");
        break;
      case "createdAt":
        updateField("createdAt", value);
        break;
      default:
        break;
    }
  }

  function handlePreviewToggle(field: PreviewToggleField) {
    updateField(field, !formState[field]);
  }

  function handlePreviewGalleryImageUpdate(index: number, value: string) {
    const lines = formState.galleryImagesText.split("\n");
    while (lines.length <= index) lines.push("");
    lines[index] = value;
    updateField("galleryImagesText", lines.join("\n"));
  }

  function handlePreviewImageNavigate(
    field: "coverImage" | "gallery",
    galleryIndex?: number
  ) {
    setWorkspaceView("edit");
    setActiveField(field);

    requestAnimationFrame(() => {
      const fieldElement = document.querySelector<HTMLElement>(
        `[data-admin-editor-field="${field}"]`
      );
      const target =
        field === "gallery" && galleryIndex !== undefined
          ? fieldElement?.querySelector<HTMLElement>(
              `[data-gallery-image-index="${galleryIndex}"]`
            )
          : fieldElement?.querySelector<HTMLElement>(
              'input:not([type="file"]), textarea, select'
            );

      (target ?? fieldElement)?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

      window.setTimeout(() => target?.focus({ preventScroll: true }), 450);
    });
  }

  return (
    <section className="mx-auto w-full max-w-[1800px] space-y-5 px-3 pb-16 pt-3 sm:px-5 sm:pb-24 lg:px-7">
      <header className="border-line/80 bg-background/95 -mx-3 border-b px-3 py-3 backdrop-blur-xl sm:-mx-5 sm:px-5 md:sticky md:top-0 md:z-40 lg:-mx-7 lg:px-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex min-h-11 items-center gap-3 rounded-full pr-2"
              aria-label="Open Lux Studio website"
            >
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-panel shadow-sm">
                <ResilientImage
                  data-company-logo
                  src="/images/brand/lux-studio-logo.svg"
                  alt=""
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              </span>
              <h1 className="sr-only sm:not-sr-only sm:block">
                <span className="block text-xs font-medium uppercase tracking-eyebrow text-foreground">
                  Lux Studio
                </span>
                <span className="block text-[0.7rem] text-muted">
                  Admin workspace
                </span>
              </h1>
            </a>
            {canEditCms ? (
              <div
                role="tablist"
                aria-label="Admin workspace"
                className="inline-flex gap-1 rounded-full border border-line bg-panel-secondary p-1"
              >
                <button
                  type="button"
                  onClick={() => setActiveTab("projects")}
                  role="tab"
                  aria-selected={activeTab === "projects"}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-eyebrow transition-colors ${
                    activeTab === "projects"
                      ? "bg-foreground text-background"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                  Projects
                  {isDirty && activeTab !== "projects" ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                  ) : null}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("settings")}
                  role="tab"
                  aria-selected={activeTab === "settings"}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-eyebrow transition-colors ${
                    activeTab === "settings"
                      ? "bg-foreground text-background"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <Settings className="h-3.5 w-3.5" />
                  Site Settings
                  {isSettingsDirty && activeTab !== "settings" ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                  ) : null}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("users")}
                  role="tab"
                  aria-selected={activeTab === "users"}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-eyebrow transition-colors ${
                    activeTab === "users"
                      ? "bg-foreground text-background"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  Admin Access
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("email")}
                  role="tab"
                  aria-selected={activeTab === "email"}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-eyebrow transition-colors ${
                    activeTab === "email"
                      ? "bg-foreground text-background"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </button>
              </div>
            ) : null}
            <AdminThemeChip />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="control-pill"
            >
              View site
              <ExternalLink className="h-4 w-4" />
            </a>
            {sessionEmail ? (
              <div className="hidden items-center gap-3 rounded-full border border-line bg-panel-secondary py-1.5 pl-2 pr-4 shadow-sm lg:flex">
                <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background">
                  <UserRound className="h-4 w-4" />
                  <span
                    className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-panel bg-success"
                    aria-hidden
                  />
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.58rem] uppercase tracking-eyebrow text-muted">
                    Signed in
                  </span>
                  <span className="block max-w-52 truncate text-sm font-medium text-foreground">
                    {sessionEmail}
                  </span>
                </span>
              </div>
            ) : null}
            {sessionEmail ? (
              <button
                type="button"
                onClick={handleSignOut}
                disabled={working}
                className="control-pill disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            ) : null}
            {canEditCms && activeTab !== "users" && activeTab !== "email" ? (
              <button
                type="button"
                onClick={handleResetClick}
                disabled={working}
                className="control-pill disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw className="h-4 w-4" />
                {activeTab === "projects" ? "Reset Project" : "Reset Settings"}
              </button>
            ) : null}
            {canEditCms && activeTab === "projects" ? (
              <button
                type="button"
                onClick={() =>
                  setIsProjectSidebarVisible((isVisible) => !isVisible)
                }
                className="control-pill hidden xl:inline-flex"
                aria-pressed={!isProjectSidebarVisible}
              >
                {isProjectSidebarVisible ? (
                  <PanelLeftClose className="h-4 w-4" />
                ) : (
                  <PanelLeftOpen className="h-4 w-4" />
                )}
                {isProjectSidebarVisible ? "Hide Projects" : "Show Projects"}
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {/* Supabase sign-in banner — shown prominently when not authenticated */}
      {isSupabaseConfigured && !sessionEmail ? (
        <div className="panel-2xl admin-theme-surface border-accent/50 border-2 p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="bg-accent/10 shrink-0 rounded-2xl p-3.5">
              <Lock className="h-7 w-7 text-accent-text" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-semibold tracking-tight text-foreground">
                Sign in to Supabase
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                File uploads, image management, and live CMS changes require an
                authenticated Supabase session. Sign in first before editing any
                project fields.
              </p>
              <form
                onSubmit={handleSignIn}
                className="mt-5 grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto]"
              >
                <label className="space-y-2 text-xs uppercase tracking-meta text-muted">
                  Admin email
                  <input
                    id="admin-email"
                    type="email"
                    autoComplete="username"
                    value={authFormState.email}
                    onChange={(e) =>
                      updateAuthFormField("email", e.target.value)
                    }
                    className="input-field text-sm normal-case tracking-normal"
                    placeholder="name@example.com"
                  />
                </label>
                <label className="space-y-2 text-xs uppercase tracking-meta text-muted">
                  Password
                  <input
                    id="admin-password"
                    type="password"
                    autoComplete="current-password"
                    value={authFormState.password}
                    onChange={(e) =>
                      updateAuthFormField("password", e.target.value)
                    }
                    className="input-field text-sm normal-case tracking-normal"
                  />
                </label>
                <button
                  type="submit"
                  disabled={working}
                  className="control-pill border-foreground bg-foreground text-background disabled:opacity-70"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </button>
              </form>
              {signInMessage ? (
                <p
                  role="status"
                  aria-live="polite"
                  className={`mt-3 flex items-center gap-2 text-sm ${
                    signInMessage.tone === "error"
                      ? "text-error-text"
                      : "text-success-text"
                  }`}
                >
                  {signInMessage.tone === "error" ? (
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  )}
                  {signInMessage.text}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {/* Compact activity and connection status */}
      {canEditCms ? (
        <div className="panel-2xl admin-theme-surface flex flex-wrap items-start justify-between gap-4 px-4 py-3.5 sm:px-5">
          <div aria-live="polite" className="min-w-0 flex-1">
            <p className="text-[0.72rem] font-medium uppercase tracking-eyebrow text-muted">
              Activity
            </p>
            {uploadProgress ? (
              <p className="mt-1 text-sm leading-6 text-foreground">
                Uploading {uploadProgress.current} of {uploadProgress.total}:{" "}
                {uploadProgress.filename}
              </p>
            ) : saveReport ? (
              <details className="group mt-1">
                <summary className="cursor-pointer text-sm font-medium text-foreground">
                  {saveReport.title}
                </summary>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {saveReport.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-2.5 rounded-xl border border-line bg-panel-secondary px-3 py-2"
                    >
                      <span className="mt-0.5 shrink-0">
                        {renderSaveReportIcon(item.tone)}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm leading-5 text-foreground">
                          {item.label}
                        </p>
                        {item.detail ? (
                          <p className="text-[0.72rem] text-muted">
                            {item.detail}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            ) : (
              <p className="mt-1 text-sm leading-6 text-muted">
                {statusMessage}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-full border border-line bg-panel-secondary px-3 py-2 text-xs text-muted">
            <span
              className={`h-2 w-2 rounded-full ${
                isSupabaseConfigured && sessionEmail
                  ? "bg-success"
                  : "bg-warning"
              }`}
              aria-hidden
            />
            {isSupabaseConfigured && sessionEmail
              ? `Supabase · ${SUPABASE_BUCKET}`
              : "Local preview mode"}
            {sessionEmail ? (
              <span className="hidden max-w-44 truncate sm:inline">
                · {sessionEmail}
              </span>
            ) : null}
          </div>
          {!isSupabaseConfigured ? (
            <details className="w-full border-t border-line pt-3 text-sm text-muted">
              <summary className="cursor-pointer text-xs uppercase tracking-eyebrow">
                Connection setup
              </summary>
              <p className="mt-2 leading-6">
                Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
                and `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` to enable live CMS
                mode.
              </p>
            </details>
          ) : null}
        </div>
      ) : null}

      {/* TAB: PROJECTS */}
      {canEditCms && activeTab === "projects" ? (
        <>
          <div
            role="tablist"
            aria-label="Project workspace view"
            className="grid grid-cols-3 gap-1 rounded-2xl border border-line bg-panel-secondary p-1 xl:hidden"
          >
            <button
              type="button"
              role="tab"
              aria-selected={workspaceView === "projects"}
              aria-controls="admin-project-list-pane"
              data-admin-workspace-mode="projects"
              onClick={() => setWorkspaceView("projects")}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-xs uppercase tracking-eyebrow ${
                workspaceView === "projects"
                  ? "bg-foreground text-background"
                  : "text-muted"
              }`}
            >
              <FolderOpen className="h-4 w-4" />
              Projects
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={workspaceView === "edit"}
              aria-controls="admin-project-editor-pane"
              data-admin-workspace-mode="edit"
              onClick={() => setWorkspaceView("edit")}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-xs uppercase tracking-eyebrow ${
                workspaceView === "edit"
                  ? "bg-foreground text-background"
                  : "text-muted"
              }`}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={workspaceView === "preview"}
              aria-controls="admin-project-preview-pane"
              data-admin-workspace-mode="preview"
              onClick={() => setWorkspaceView("preview")}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-xs uppercase tracking-eyebrow ${
                workspaceView === "preview"
                  ? "bg-foreground text-background"
                  : "text-muted"
              }`}
            >
              <Monitor className="h-4 w-4" />
              Preview
            </button>
          </div>

          <div
            className={`grid gap-6 ${
              isProjectSidebarVisible
                ? "xl:grid-cols-[250px_minmax(0,1fr)_390px]"
                : "xl:grid-cols-[minmax(0,1fr)_390px]"
            }`}
          >
            <div
              id="admin-project-list-pane"
              role="tabpanel"
              className={`${workspaceView === "projects" ? "block" : "hidden"} ${
                isProjectSidebarVisible ? "xl:block" : "xl:hidden"
              }`}
            >
              <ProjectSidebar
                templates={templateProjects}
                projects={projects}
                selectedProjectKey={selectedProjectKey}
                isDirty={isDirty}
                onSelect={(project) => {
                  selectProject(project);
                  setWorkspaceView("edit");
                }}
                onNew={() => {
                  newProject();
                  setWorkspaceView("edit");
                }}
              />
            </div>
            <div
              id="admin-project-editor-pane"
              role="tabpanel"
              className={`${workspaceView === "edit" ? "block" : "hidden"} min-w-0 xl:block`}
            >
              <AdminErrorBoundary
                panelLabel="project editor"
                hasUnsavedChanges={isDirty}
              >
                <ProjectEditor
                  galleryKey={`${formState.id ?? formState.slug}-${saveCount}`}
                  formState={formState}
                  updateField={updateField}
                  handleFileSelection={handleFileSelection}
                  handleSave={handleSave}
                  handleDeleteClick={handleDeleteClick}
                  duplicateProject={duplicateProject}
                  addGalleryFiles={addGalleryFiles}
                  removeGalleryFile={removeGalleryFile}
                  coverFile={coverFile}
                  coverPreviewSrc={coverPreviewImage}
                  setCoverFile={setCoverFile}
                  videoFile={videoFile}
                  setVideoFile={setVideoFile}
                  galleryFiles={galleryFiles}
                  working={working}
                  isDirty={isDirty}
                  isTemplate={isTemplateProject}
                  completionIssues={completionIssues}
                  isProjectComplete={isProjectComplete}
                  galleryImageList={galleryImageList}
                  captionRawLines={captionRawLines}
                  uploadProgress={uploadProgress}
                  slugValidation={slugValidation}
                  onSlugBlur={handleSlugBlur}
                  onApplySuggestedSlug={applySuggestedSlug}
                  activeField={activeField}
                  onActiveFieldChange={setActiveField}
                />
              </AdminErrorBoundary>
            </div>
            <div
              id="admin-project-preview-pane"
              role="tabpanel"
              className={`${workspaceView === "preview" ? "block" : "hidden"} min-w-0 xl:block`}
            >
              <AdminErrorBoundary
                panelLabel="live preview"
                hasUnsavedChanges={isDirty}
              >
                <LivePreview
                  formState={deferredPreviewFormState}
                  coverPreviewSrc={deferredCoverPreview}
                  isDirty={isDirty}
                  galleryImageList={deferredPreviewGallery}
                  captionRawLines={deferredPreviewCaptions}
                  activeField={activeField}
                  onActiveFieldChange={setActiveField}
                  onUpdateField={handlePreviewFieldUpdate}
                  onUpdateCaption={updateCaption}
                  onReplaceGalleryImage={handlePreviewGalleryImageUpdate}
                  onToggleField={handlePreviewToggle}
                  onNavigateToImageField={handlePreviewImageNavigate}
                  liveProjectHref={liveProjectHref}
                />
              </AdminErrorBoundary>
            </div>
          </div>
        </>
      ) : null}

      {/* TAB: SITE SETTINGS */}
      {canEditCms && activeTab === "settings" ? (
        <AdminErrorBoundary
          panelLabel="site settings"
          hasUnsavedChanges={isSettingsDirty}
        >
          <SiteSettingsForm
            projects={projects}
            formState={siteSettingsFormState}
            isDirty={isSettingsDirty}
            updateField={updateSiteSettingsField}
            onSubmit={handleSaveSiteSettings}
            working={working}
            siteHeroVideoFile={siteHeroVideoFile}
            selectedFrameFiles={selectedFrameFiles}
            aboutTeamGalleryFiles={aboutTeamGalleryFiles}
            aboutTeamMemberImageFiles={aboutTeamMemberImageFiles}
            setSiteHeroVideoFile={setSiteHeroVideoFile}
            addSelectedFrameFiles={addSelectedFrameFiles}
            removeSelectedFrameFile={removeSelectedFrameFile}
            addAboutTeamGalleryFiles={addAboutTeamGalleryFiles}
            removeAboutTeamGalleryFile={removeAboutTeamGalleryFile}
            setAboutTeamMemberImageFile={setAboutTeamMemberImageFile}
            removeAboutTeamMemberImageFile={removeAboutTeamMemberImageFile}
            moveAboutTeamMemberImageFile={moveAboutTeamMemberImageFile}
            handleFileSelection={handleFileSelection}
          />
        </AdminErrorBoundary>
      ) : null}

      {/* TAB: ADMIN ACCESS */}
      {canEditCms && activeTab === "users" ? (
        <AdminErrorBoundary panelLabel="admin access">
          <AdminUsersPanel />
        </AdminErrorBoundary>
      ) : null}

      {/* TAB: EMAIL SETTINGS */}
      {canEditCms && activeTab === "email" ? (
        <AdminErrorBoundary panelLabel="email settings">
          <AdminEmailSettingsPanel />
        </AdminErrorBoundary>
      ) : null}

      <AdminConfirmModal
        dialog={confirmDialog}
        working={working}
        onClose={closeConfirmDialog}
        onConfirm={() => void confirmDialogAction()}
        onSecondary={() => void secondaryDialogAction()}
        onInputChange={updateConfirmDialogInput}
      />
    </section>
  );
}
