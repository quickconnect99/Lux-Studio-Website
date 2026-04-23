"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  FolderOpen,
  Info,
  LogIn,
  LogOut,
  RefreshCw,
  Settings
} from "lucide-react";
import { isSupabaseConfigured, SUPABASE_BUCKET } from "@/lib/supabase";
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
    handleDeleteClick,
    handleResetClick,
    selectProject,
    newProject,
    duplicateProject,
    siteSettingsFormState,
    updateSiteSettingsField,
    handleSaveSiteSettings
  } = data;

  const liveProjectHref =
    formState.id && formState.published ? `/work/${formState.slug}` : null;

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
            onClick={handleExitAdmin}
            className="control-pill"
          >
            <LogOut className="h-4 w-4" />
            Exit Admin
          </button>
          <button
            type="button"
            onClick={handleResetClick}
            className="control-pill"
          >
            <RefreshCw className="h-4 w-4" />
            Reset Form
          </button>
        </div>
      </div>

      {/* CMS status + Supabase access */}
      <div
        className={`grid gap-6 ${
          sessionEmail ? "sm:grid-cols-[1fr_320px]" : "grid-cols-1"
        }`}
      >
        <div className="panel-2xl p-6">
          <p className="text-xs uppercase tracking-eyebrow text-muted">
            CMS state
          </p>
          <div aria-live="polite" className="mt-3">
            {uploadProgress ? (
              <p className="text-sm leading-7 text-muted">
                Uploading file {uploadProgress.current} of {uploadProgress.total}
                : {uploadProgress.filename}
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
              <div className="mt-4 grid gap-3 md:grid-cols-2">
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
                  className="control-pill w-fit border-foreground bg-foreground text-background disabled:opacity-70 md:col-span-2"
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
      {activeTab === "settings" ? (
        <SiteSettingsForm
          formState={siteSettingsFormState}
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
