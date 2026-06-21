"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FolderOpen,
  Lock,
  LogIn,
  LogOut,
  RefreshCw,
  Settings,
  UserRound
} from "lucide-react";
import { AdminThemeChip } from "@/components/admin/admin-theme-chip";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useAdminData } from "@/hooks/use-admin-data";
import { AdminConfirmModal } from "@/components/admin/admin-confirm-modal";
import { ProjectSidebar } from "@/components/admin/project-sidebar";
import { ProjectEditor } from "@/components/admin/project-editor";
import {
  type PreviewEditableField,
  type PreviewToggleField,
  LivePreview
} from "@/components/admin/live-preview";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { slugify } from "@/lib/admin-utils";
import type { AdminProjectFieldKey } from "@/lib/admin-types";

export function AdminDashboard() {
  const router = useRouter();
  const data = useAdminData();
  const [activeField, setActiveField] = useState<AdminProjectFieldKey | null>(
    null
  );

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
        updateField("category", value as typeof formState.category);
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

  async function handleExitAdmin() {
    await handleSignOut();
    await fetch("/api/admin-gate/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
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
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-eyebrow transition-colors ${
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
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-eyebrow transition-colors ${
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
          <button
            type="button"
            onClick={handleExitAdmin}
            className="control-pill"
          >
            <LogOut className="h-4 w-4" />
            Exit Admin
          </button>
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
              <div className="mt-5 grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <input
                  type="email"
                  value={authFormState.email}
                  onChange={(e) => updateAuthFormField("email", e.target.value)}
                  className="input-field text-sm"
                  placeholder="Admin email"
                />
                <input
                  type="password"
                  value={authFormState.password}
                  onChange={(e) =>
                    updateAuthFormField("password", e.target.value)
                  }
                  className="input-field text-sm"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={working}
                  className="control-pill border-foreground bg-foreground text-background disabled:opacity-70"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* TAB: PROJECTS */}
      {canEditCms && activeTab === "projects" ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px] xl:grid-cols-[240px_minmax(0,1fr)_360px]">
          <ProjectSidebar
            templates={templateProjects}
            projects={projects}
            selectedProjectKey={selectedProjectKey}
            isDirty={isDirty}
            onSelect={selectProject}
            onNew={newProject}
          />
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
            liveProjectHref={liveProjectHref}
          />
        </div>
      ) : null}

      {/* TAB: SITE SETTINGS */}
      {canEditCms && activeTab === "settings" ? (
        <SiteSettingsForm
          formState={siteSettingsFormState}
          isDirty={isSettingsDirty}
          updateField={updateSiteSettingsField}
          onSubmit={handleSaveSiteSettings}
          working={working}
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
