"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  AlertTriangle,
  CheckCircle2,
  FolderOpen,
  Info,
  Lock,
  LogIn,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Settings,
  UserRound
} from "lucide-react";
import { AdminThemeChip } from "@/components/admin/admin-theme-chip";
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

export function AdminDashboard() {
  const data = useAdminData();
  const [activeField, setActiveField] = useState<AdminProjectFieldKey | null>(
    null
  );
  const [isProjectSidebarVisible, setIsProjectSidebarVisible] = useState(true);

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

  function renderSaveReportIcon(tone: "success" | "warning" | "info") {
    if (tone === "success") {
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    }

    if (tone === "warning") {
      return <AlertTriangle className="h-4 w-4 text-warning" />;
    }

    return <Info className="h-4 w-4 text-accent" />;
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
    <section className="section-shell space-y-6 pb-24">
      {/* Tab bar + session controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {canEditCms ? (
            <div className="inline-flex gap-1 rounded-full border border-line bg-panel-secondary p-1">
              <button
                type="button"
                onClick={() => setActiveTab("projects")}
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
            </div>
          ) : null}
          <AdminThemeChip />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {sessionEmail ? (
            <div className="flex items-center gap-3 rounded-full border border-line bg-panel-secondary py-1.5 pl-2 pr-4 shadow-sm">
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
              className="control-pill"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          ) : null}
          {canEditCms ? (
            <button
              type="button"
              onClick={handleResetClick}
              className="control-pill"
            >
              <RefreshCw className="h-4 w-4" />
              Reset Form
            </button>
          ) : null}
          {canEditCms && activeTab === "projects" ? (
            <button
              type="button"
              onClick={() =>
                setIsProjectSidebarVisible((isVisible) => !isVisible)
              }
              className="control-pill"
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

      {/* Supabase sign-in banner — shown prominently when not authenticated */}
      {isSupabaseConfigured && !sessionEmail ? (
        <div className="panel-2xl admin-theme-surface border-accent/50 border-2 p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="bg-accent/10 shrink-0 rounded-2xl p-3.5">
              <Lock className="h-7 w-7 text-accent" />
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
                <input
                  type="email"
                  autoComplete="username"
                  value={authFormState.email}
                  onChange={(e) => updateAuthFormField("email", e.target.value)}
                  className="input-field text-sm"
                  placeholder="Admin email"
                />
                <input
                  type="password"
                  autoComplete="current-password"
                  value={authFormState.password}
                  onChange={(e) =>
                    updateAuthFormField("password", e.target.value)
                  }
                  className="input-field text-sm"
                  placeholder="Password"
                />
                <button
                  type="submit"
                  disabled={working}
                  className="control-pill border-foreground bg-foreground text-background disabled:opacity-70"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      {/* CMS status + Supabase access */}
      {canEditCms ? (
        <div
          className={`grid gap-6 ${
            sessionEmail ? "sm:grid-cols-[1fr_320px]" : "grid-cols-1"
          }`}
        >
          <div className="panel-2xl admin-theme-surface p-6">
            <p className="text-xs uppercase tracking-eyebrow text-muted">
              CMS state
            </p>
            <div aria-live="polite" className="mt-3">
              {uploadProgress ? (
                <p className="text-sm leading-7 text-muted">
                  Uploading file {uploadProgress.current} of{" "}
                  {uploadProgress.total}: {uploadProgress.filename}
                </p>
              ) : saveReport ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">
                    {saveReport.title}
                  </p>
                  <div className="space-y-2">
                    {saveReport.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 rounded-[1rem] border border-line bg-panel-secondary px-3 py-2.5"
                      >
                        <span className="mt-0.5 shrink-0">
                          {renderSaveReportIcon(item.tone)}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm leading-6 text-foreground">
                            {item.label}
                          </p>
                          {item.detail ? (
                            <p className="text-xs uppercase tracking-meta text-muted">
                              {item.detail}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm leading-7 text-muted">{statusMessage}</p>
              )}
            </div>
          </div>

          {sessionEmail || !isSupabaseConfigured ? (
            <div className="panel-2xl admin-theme-surface p-6">
              <p className="text-xs uppercase tracking-eyebrow text-muted">
                Supabase access
              </p>
              {isSupabaseConfigured && sessionEmail ? (
                <div className="mt-4 space-y-3 text-sm leading-7 text-muted">
                  <p>Signed in as {sessionEmail}</p>
                  <p>Uploads target the `{SUPABASE_BUCKET}` storage bucket.</p>
                </div>
              ) : (
                <p className="mt-4 text-sm leading-7 text-muted">
                  Add `NEXT_PUBLIC_SUPABASE_URL`,
                  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
                  `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` to enable live CMS mode.
                </p>
              )}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* TAB: PROJECTS */}
      {canEditCms && activeTab === "projects" ? (
        <div
          className={`grid gap-6 ${
            isProjectSidebarVisible
              ? "lg:grid-cols-[1fr_320px] xl:grid-cols-[240px_minmax(0,1fr)_360px]"
              : "lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]"
          }`}
        >
          {isProjectSidebarVisible ? (
            <ProjectSidebar
              templates={templateProjects}
              projects={projects}
              selectedProjectKey={selectedProjectKey}
              isDirty={isDirty}
              onSelect={selectProject}
              onNew={newProject}
            />
          ) : null}
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
          <LivePreview
            formState={formState}
            coverPreviewSrc={coverPreviewImage}
            isDirty={isDirty}
            galleryImageList={galleryImageList}
            captionRawLines={captionRawLines}
            activeField={activeField}
            onActiveFieldChange={setActiveField}
            onUpdateField={handlePreviewFieldUpdate}
            onUpdateCaption={updateCaption}
            onReplaceGalleryImage={handlePreviewGalleryImageUpdate}
            onToggleField={handlePreviewToggle}
            onNavigateToImageField={handlePreviewImageNavigate}
            liveProjectHref={liveProjectHref}
          />
        </div>
      ) : null}

      {/* TAB: SITE SETTINGS */}
      {canEditCms && activeTab === "settings" ? (
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
          handleFileSelection={handleFileSelection}
        />
      ) : null}

      <AdminConfirmModal
        dialog={confirmDialog}
        working={working}
        onClose={closeConfirmDialog}
        onConfirm={() => void confirmDialogAction()}
        onInputChange={updateConfirmDialogInput}
      />
    </section>
  );
}
