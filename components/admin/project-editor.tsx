import { type ChangeEvent } from "react";
import Image from "next/image";
import { AlertCircle, CloudUpload, Copy, ExternalLink, RefreshCw, Trash2 } from "lucide-react";
import type { ProjectFormState } from "@/lib/admin-types";
import { businesses, categories, slugify } from "@/lib/admin-utils";
import {
  getProjectPrimaryMetaLabel,
  getProjectPrimaryMetaPlaceholder
} from "@/lib/project-business";
import type { ProjectCategory } from "@/lib/types";
import { GalleryEditor } from "@/components/admin/gallery-editor";

type UploadProgress = { current: number; total: number; filename: string };

type Props = {
  galleryKey: string;
  formState: ProjectFormState;
  updateField: <K extends keyof ProjectFormState>(
    key: K,
    value: ProjectFormState[K]
  ) => void;
  handleFileSelection: (
    event: ChangeEvent<HTMLInputElement>,
    type: "cover" | "video"
  ) => void;
  handleSave: (event?: { preventDefault(): void }) => void;
  handleDeleteClick: () => void;
  duplicateProject: () => void;
  addGalleryFiles: (files: File[]) => void;
  removeGalleryFile: (index: number) => void;
  coverFile: File | null;
  setCoverFile: (file: File | null) => void;
  videoFile: File | null;
  setVideoFile: (file: File | null) => void;
  galleryFiles: File[];
  working: boolean;
  isDirty: boolean;
  completionIssues: string[];
  isProjectComplete: boolean;
  deleteConfirmPending: boolean;
  galleryImageList: string[];
  captionRawLines: string[];
  uploadProgress: UploadProgress | null;
};

export function ProjectEditor({
  galleryKey,
  formState,
  updateField,
  handleFileSelection,
  handleSave,
  handleDeleteClick,
  duplicateProject,
  addGalleryFiles,
  removeGalleryFile,
  coverFile,
  setCoverFile,
  videoFile,
  setVideoFile,
  galleryFiles,
  working,
  isDirty,
  completionIssues,
  isProjectComplete,
  deleteConfirmPending,
  galleryImageList,
  captionRawLines,
  uploadProgress
}: Props) {
  const primaryMetaLabel = getProjectPrimaryMetaLabel(formState.business);
  const primaryMetaPlaceholder = getProjectPrimaryMetaPlaceholder(
    formState.business
  );

  const dateValue = formState.createdAt ? formState.createdAt.split("T")[0] : "";

  function handleDateChange(dateStr: string) {
    if (!dateStr) return;
    const timePart =
      formState.createdAt.includes("T")
        ? formState.createdAt.split("T")[1]
        : "12:00:00.000Z";
    updateField("createdAt", `${dateStr}T${timePart}`);
  }

  function handleGalleryChange(images: string[], captions: string[]) {
    updateField("galleryImagesText", images.join("\n"));
    updateField("galleryCaptionsText", captions.join("\n"));
  }

  const canViewOnSite = Boolean(formState.id) && formState.published;

  return (
    <div className="min-w-0">
      <form
        id="project-form"
        onSubmit={handleSave}
        className="panel-2xl p-6 sm:p-8"
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
          <div>
            <p className="text-xs uppercase tracking-eyebrow text-muted">
              Project editor
            </p>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm leading-7">
              {uploadProgress ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-accent" />
                  <span className="text-accent">
                    Uploading {uploadProgress.current} / {uploadProgress.total}
                    {" · "}
                    {uploadProgress.filename}
                  </span>
                </>
              ) : isDirty ? (
                <>
                  <AlertCircle className="h-3.5 w-3.5 text-warning" />
                  <span className="text-warning">
                    Unsaved changes · Ctrl+S to save
                  </span>
                </>
              ) : (
                <span className="text-muted">No unsaved changes.</span>
              )}
            </p>
            <p className="mt-1 text-xs text-muted">
              <span className="text-error">*</span> Required field
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={duplicateProject}
              disabled={working}
              className="control-pill"
              title="Duplicate this project"
            >
              <Copy className="h-4 w-4" />
              Duplicate
            </button>
            {formState.id ? (
              <button
                type="button"
                onClick={handleDeleteClick}
                disabled={working}
                className={`control-pill transition-colors ${
                  deleteConfirmPending
                    ? "border-error bg-error text-white"
                    : "hover:border-error/40 text-error"
                }`}
              >
                <Trash2 className="h-4 w-4" />
                {deleteConfirmPending ? "Confirm delete?" : "Delete"}
              </button>
            ) : null}
            <button
              type="submit"
              disabled={working || !isProjectComplete}
              className="action-button"
            >
              {working ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <CloudUpload className="h-4 w-4" />
              )}
              {isDirty ? "Save Changes" : "Save Project"}
            </button>
          </div>
        </div>

        {/* Title + Slug */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-muted">
            <span className="text-xs uppercase tracking-eyebrow">
              Title <span className="text-error">*</span>
            </span>
            <input
              required
              value={formState.title}
              onChange={(e) => {
                const value = e.target.value;
                updateField("title", value);
                updateField("slug", slugify(value));
              }}
              className="input-field"
            />
          </label>
          <label className="space-y-2 text-sm text-muted">
            <span className="text-xs uppercase tracking-eyebrow">
              Slug <span className="text-error">*</span>
            </span>
            <input
              required
              value={formState.slug}
              onChange={(e) => updateField("slug", slugify(e.target.value))}
              className="input-field"
            />
          </label>
        </div>

        {/* Category + meta */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <label className="space-y-2 text-sm text-muted">
            <span className="text-xs uppercase tracking-eyebrow">Business</span>
            <select
              value={formState.business}
              onChange={(e) =>
                updateField(
                  "business",
                  e.target.value as ProjectFormState["business"]
                )
              }
              className="input-field"
            >
              {businesses.map((business) => (
                <option key={business} value={business}>
                  {business}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm text-muted">
            <span className="text-xs uppercase tracking-eyebrow">Category</span>
            <select
              value={formState.category}
              onChange={(e) =>
                updateField("category", e.target.value as ProjectCategory)
              }
              className="input-field"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm text-muted">
            <span className="text-xs uppercase tracking-eyebrow">
              {primaryMetaLabel} <span className="text-error">*</span>
            </span>
            <input
              value={formState.carModel}
              onChange={(e) => updateField("carModel", e.target.value)}
              className="input-field"
              placeholder={primaryMetaPlaceholder}
            />
          </label>
          <label className="space-y-2 text-sm text-muted">
            <span className="text-xs uppercase tracking-eyebrow">
              Location <span className="text-error">*</span>
            </span>
            <input
              value={formState.location}
              onChange={(e) => updateField("location", e.target.value)}
              className="input-field"
            />
          </label>
          <label className="space-y-2 text-sm text-muted">
            <span className="text-xs uppercase tracking-eyebrow">
              Year <span className="text-error">*</span>
            </span>
            <input
              value={formState.year}
              onChange={(e) => updateField("year", e.target.value)}
              className="input-field"
            />
          </label>
        </div>

        {/* Descriptions */}
        <label className="mt-4 block space-y-2 text-sm text-muted">
          <span className="text-xs uppercase tracking-eyebrow">
            Short description <span className="text-error">*</span>
          </span>
          <textarea
            value={formState.shortDescription}
            onChange={(e) => updateField("shortDescription", e.target.value)}
            className="textarea-field min-h-28"
          />
        </label>

        <label className="mt-4 block space-y-2 text-sm text-muted">
          <span className="text-xs uppercase tracking-eyebrow">
            Full description <span className="text-error">*</span>
          </span>
          <textarea
            value={formState.fullDescription}
            onChange={(e) => updateField("fullDescription", e.target.value)}
            className="textarea-field min-h-40"
          />
        </label>

        <label className="mt-4 block space-y-2 text-sm text-muted">
          <span className="text-xs uppercase tracking-eyebrow">
            Behind the scenes
          </span>
          <textarea
            value={formState.behindTheScenes}
            onChange={(e) => updateField("behindTheScenes", e.target.value)}
            className="textarea-field min-h-28"
          />
        </label>

        {/* Cover image */}
        <div className="mt-4 space-y-2 text-sm text-muted">
          <span className="text-xs uppercase tracking-eyebrow">
            Cover image <span className="text-error">*</span>
          </span>
          <div className="flex gap-4">
            {formState.coverImage ? (
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[1rem] border border-line bg-panel-dark">
                <Image
                  src={formState.coverImage}
                  alt="Cover preview"
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
            ) : null}
            <div className="flex-1 space-y-2">
              <input
                value={formState.coverImage}
                onChange={(e) => updateField("coverImage", e.target.value)}
                className="input-field"
                placeholder="/images/cover.jpg"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelection(e, "cover")}
                className="block w-full text-xs uppercase tracking-meta text-muted"
              />
              {coverFile ? (
                <p className="text-xs text-muted">Queued: {coverFile.name}</p>
              ) : null}
            </div>
          </div>
        </div>

        {/* Gallery — visual grid editor */}
        <div className="mt-4 space-y-2 text-sm text-muted">
          <span className="text-xs uppercase tracking-eyebrow">
            Gallery images <span className="text-error">*</span>
          </span>
          <GalleryEditor
            key={galleryKey}
            images={galleryImageList}
            captions={captionRawLines}
            pendingFiles={galleryFiles}
            onImagesChange={handleGalleryChange}
            onFilesAdd={addGalleryFiles}
            onFileRemove={removeGalleryFile}
          />
        </div>

        {/* Video */}
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <label className="space-y-2 text-sm text-muted">
            <span className="text-xs uppercase tracking-eyebrow">
              Video URL
              {formState.videoUrl && !formState.uploadedVideo && !videoFile
                ? " · active"
                : ""}
            </span>
            <input
              value={formState.videoUrl}
              onChange={(e) => {
                updateField("videoUrl", e.target.value);
                if (e.target.value) {
                  updateField("uploadedVideo", "");
                  setVideoFile(null);
                }
              }}
              className="input-field"
              placeholder="YouTube, Vimeo, or direct MP4 URL"
            />
          </label>
          <div className="space-y-2 text-sm text-muted">
            <span className="text-xs uppercase tracking-eyebrow">
              Uploaded video
              {formState.uploadedVideo || videoFile ? " · active" : ""}
            </span>
            <input
              value={formState.uploadedVideo}
              onChange={(e) => {
                updateField("uploadedVideo", e.target.value);
                if (e.target.value) updateField("videoUrl", "");
              }}
              className="input-field"
            />
            <input
              type="file"
              accept="video/*"
              onChange={(e) => {
                handleFileSelection(e, "video");
                if ((e.target.files?.length ?? 0) > 0)
                  updateField("videoUrl", "");
              }}
              className="block w-full text-xs uppercase tracking-meta text-muted"
            />
            {videoFile ? (
              <p className="text-xs text-muted">Queued: {videoFile.name}</p>
            ) : null}
          </div>
        </div>

        {/* Publish settings */}
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {/* Datepicker for createdAt */}
          <div className="space-y-2 text-sm text-muted">
            <span className="text-xs uppercase tracking-eyebrow">
              Created at
            </span>
            <input
              type="date"
              value={dateValue}
              onChange={(e) => handleDateChange(e.target.value)}
              className="input-field"
            />
            <button
              type="button"
              onClick={() => updateField("createdAt", new Date().toISOString())}
              className="control-pill text-xs"
            >
              Today
            </button>
          </div>
          <div className="space-y-2">
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={formState.featured}
                onChange={(e) => updateField("featured", e.target.checked)}
                className="h-4 w-4"
              />
              Featured project
            </label>
            <p className="px-1 text-xs leading-6 text-muted">
              Appears in the curated homepage highlights.
            </p>
          </div>
          <div className="space-y-2">
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={formState.published}
                onChange={(e) => updateField("published", e.target.checked)}
                className="h-4 w-4"
              />
              Published
            </label>
            <p className="px-1 text-xs leading-6 text-muted">
              Makes the project visible on the public site.
            </p>
          </div>
        </div>
      </form>

      {/* Sticky save bar */}
      <div className="sticky bottom-4 z-20 mt-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-panel px-4 py-3 shadow-lg backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-xs leading-6 text-muted">
              {isProjectComplete
                ? isDirty
                  ? "Ready to save."
                  : "No unsaved changes."
                : `Missing: ${completionIssues.join(", ")}.`}
            </p>
            {canViewOnSite ? (
              <a
                href={`/work/${formState.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-eyebrow text-accent hover:underline"
              >
                View on site
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            {formState.id ? (
              <button
                type="button"
                onClick={handleDeleteClick}
                disabled={working}
                className={`control-pill transition-colors ${
                  deleteConfirmPending
                    ? "border-error bg-error text-white"
                    : "hover:border-error/40 text-error"
                }`}
              >
                <Trash2 className="h-4 w-4" />
                {deleteConfirmPending ? "Confirm delete?" : "Delete"}
              </button>
            ) : null}
            <button
              type="submit"
              form="project-form"
              disabled={working || !isProjectComplete}
              className="action-button"
            >
              {working ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <CloudUpload className="h-4 w-4" />
              )}
              {isDirty ? "Save Changes" : "Save Project"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
