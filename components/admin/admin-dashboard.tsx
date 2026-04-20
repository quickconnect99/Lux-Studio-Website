"use client";

import { FolderOpen, LogIn, LogOut, RefreshCw, Settings } from "lucide-react";
import { isSupabaseConfigured, SUPABASE_BUCKET } from "@/lib/supabase";
import { useAdminData } from "@/hooks/use-admin-data";
import { ProjectSidebar } from "@/components/admin/project-sidebar";
import { ProjectEditor } from "@/components/admin/project-editor";
import {
  type PreviewEditableField,
  type PreviewToggleField,
  LivePreview
} from "@/components/admin/live-preview";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { slugify } from "@/lib/admin-utils";

export function AdminDashboard() {
  const data = useAdminData();

  const {
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
  } = data;

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

  return (
    <section className="section-shell space-y-6 pb-24">
      {/* Tab bar + session controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
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
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {sessionEmail ? (
            <p className="text-xs uppercase tracking-eyebrow text-muted">
              {sessionEmail}
            </p>
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
            onClick={handleResetClick}
            className={`control-pill transition-colors ${
              resetConfirmPending
                ? "bg-warning/10 border-warning text-warning"
                : ""
            }`}
          >
            <RefreshCw className="h-4 w-4" />
            {resetConfirmPending ? "Confirm reset?" : "Reset Form"}
          </button>
        </div>
      </div>

      {/* CMS status + Supabase access */}
      <div className="grid gap-6 sm:grid-cols-[1fr_260px]">
        <div className="panel-2xl p-6">
          <p className="text-xs uppercase tracking-eyebrow text-muted">
            CMS state
          </p>
          <p className="mt-2 text-sm leading-7 text-muted">
            {uploadProgress
              ? `Uploading file ${uploadProgress.current} of ${uploadProgress.total}: ${uploadProgress.filename}`
              : statusMessage}
          </p>
        </div>

        <div className="panel-2xl p-6">
          <p className="text-xs uppercase tracking-eyebrow text-muted">
            Supabase access
          </p>
          {isSupabaseConfigured ? (
            sessionEmail ? (
              <div className="mt-4 space-y-3 text-sm leading-7 text-muted">
                <p>Signed in as {sessionEmail}</p>
                <p>Uploads target the `{SUPABASE_BUCKET}` storage bucket.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
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
            )
          ) : (
            <p className="mt-4 text-sm leading-7 text-muted">
              Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
              and `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` to enable live CMS
              mode.
            </p>
          )}
        </div>
      </div>

      {/* TAB: PROJECTS */}
      {activeTab === "projects" ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px] xl:grid-cols-[240px_minmax(0,1fr)_360px]">
          <ProjectSidebar
            projects={projects}
            selectedSlug={selectedSlug}
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
            setCoverFile={setCoverFile}
            videoFile={videoFile}
            setVideoFile={setVideoFile}
            galleryFiles={galleryFiles}
            working={working}
            isDirty={isDirty}
            completionIssues={completionIssues}
            isProjectComplete={isProjectComplete}
            deleteConfirmPending={deleteConfirmPending}
            galleryImageList={galleryImageList}
            captionRawLines={captionRawLines}
            uploadProgress={uploadProgress}
          />
          <LivePreview
            formState={formState}
            isDirty={isDirty}
            galleryImageList={galleryImageList}
            captionRawLines={captionRawLines}
            onUpdateField={handlePreviewFieldUpdate}
            onUpdateCaption={updateCaption}
            onReplaceGalleryImage={handlePreviewGalleryImageUpdate}
            onToggleField={handlePreviewToggle}
          />
        </div>
      ) : null}

      {/* TAB: SITE SETTINGS */}
      {activeTab === "settings" ? (
        <SiteSettingsForm
          formState={siteSettingsFormState}
          updateField={updateSiteSettingsField}
          onSubmit={handleSaveSiteSettings}
          working={working}
        />
      ) : null}
    </section>
  );
}
