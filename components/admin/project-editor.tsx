"use client";

import {
  type ChangeEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  AlertCircle,
  CircleHelp,
  CloudUpload,
  Copy,
  ExternalLink,
  RefreshCw,
  Trash2
} from "lucide-react";
import { FieldError } from "@/components/ui/field-error";
import { GalleryEditor } from "@/components/admin/gallery-editor";
import {
  adminProjectFieldMeta,
  getGalleryFrameRole
} from "@/lib/admin-project-fields";
import type {
  AdminUploadProgress,
  AdminProjectFieldKey,
  ProjectFormState,
  SlugValidationState
} from "@/lib/admin-types";
import { businesses, categories, slugify } from "@/lib/admin-utils";
import { cn } from "@/lib/utils";

function FieldHelpTooltip({ fieldKey }: { fieldKey: AdminProjectFieldKey }) {
  const meta = adminProjectFieldMeta[fieldKey];
  const tooltipId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{
    left: number;
    top: number;
    width: number;
  } | null>(null);

  useEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }

    function updatePosition() {
      const button = buttonRef.current;
      const tooltip = tooltipRef.current;

      if (!button || !tooltip) {
        return;
      }

      const gutter = 16;
      const gap = 8;
      const buttonRect = button.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const width = Math.min(288, window.innerWidth - gutter * 2);
      const left = Math.min(
        Math.max(buttonRect.left, gutter),
        window.innerWidth - width - gutter
      );
      const below = buttonRect.bottom + gap;
      const top =
        below + tooltipRect.height <= window.innerHeight - gutter
          ? below
          : Math.max(gutter, buttonRect.top - tooltipRect.height - gap);

      setPosition({ left, top, width });
    }

    const frame = window.requestAnimationFrame(updatePosition);

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("keydown", handleEscape);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        ref={buttonRef}
        type="button"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-panel hover:text-foreground"
        aria-label={`Where is ${meta.label} shown?`}
        aria-describedby={open ? tooltipId : undefined}
        onClick={() => setOpen(true)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <CircleHelp className="h-4 w-4" />
      </button>
      {open && typeof document !== "undefined"
        ? createPortal(
            <span
              ref={tooltipRef}
              id={tooltipId}
              role="tooltip"
              style={
                position
                  ? {
                      left: position.left,
                      top: position.top,
                      width: position.width
                    }
                  : undefined
              }
              className={cn(
                "pointer-events-none fixed z-[100] rounded-[1rem] border border-line bg-background/95 px-3 py-2 text-[0.7rem] normal-case tracking-normal text-muted shadow-card backdrop-blur-xl",
                position ? "opacity-100" : "opacity-0"
              )}
            >
              {meta.helpText}
            </span>,
            document.body
          )
        : null}
    </span>
  );
}

function FieldLabel({
  fieldKey,
  required = false,
  children
}: {
  fieldKey: AdminProjectFieldKey;
  required?: boolean;
  children?: ReactNode;
}) {
  return (
    <span className="flex items-center gap-1.5 text-xs uppercase tracking-eyebrow">
      <span>
        {children ?? adminProjectFieldMeta[fieldKey].label}
        {required ? <span className="text-error"> *</span> : null}
      </span>
      <FieldHelpTooltip fieldKey={fieldKey} />
    </span>
  );
}

function EditorFieldShell({
  fieldKey,
  activeField,
  onActiveFieldChange,
  className,
  children
}: {
  fieldKey: AdminProjectFieldKey;
  activeField: AdminProjectFieldKey | null;
  onActiveFieldChange: (field: AdminProjectFieldKey | null) => void;
  className?: string;
  children: ReactNode;
}) {
  const isHighlighted = activeField === fieldKey;

  return (
    <div
      data-admin-editor-field={fieldKey}
      onMouseEnter={() => onActiveFieldChange(fieldKey)}
      onMouseLeave={() => onActiveFieldChange(null)}
      onFocusCapture={() => onActiveFieldChange(fieldKey)}
      onBlurCapture={(event) => {
        const nextTarget = event.relatedTarget as Node | null;
        if (!event.currentTarget.contains(nextTarget)) {
          onActiveFieldChange(null);
        }
      }}
      className={cn(
        "rounded-[1.5rem] p-3 ring-1 ring-transparent transition-colors",
        isHighlighted ? "bg-accent/5 ring-accent/40" : "",
        className
      )}
    >
      {children}
    </div>
  );
}

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
  coverPreviewSrc: string;
  setCoverFile: (file: File | null) => void;
  videoFile: File | null;
  setVideoFile: (file: File | null) => void;
  galleryFiles: File[];
  working: boolean;
  isDirty: boolean;
  isTemplate: boolean;
  completionIssues: string[];
  isProjectComplete: boolean;
  galleryImageList: string[];
  captionRawLines: string[];
  uploadProgress: AdminUploadProgress | null;
  slugValidation: SlugValidationState;
  onSlugBlur: () => void;
  onApplySuggestedSlug: () => void;
  activeField: AdminProjectFieldKey | null;
  onActiveFieldChange: (field: AdminProjectFieldKey | null) => void;
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
  coverPreviewSrc,
  setCoverFile,
  videoFile,
  setVideoFile,
  galleryFiles,
  working,
  isDirty,
  isTemplate,
  completionIssues,
  isProjectComplete,
  galleryImageList,
  captionRawLines,
  uploadProgress,
  slugValidation,
  onSlugBlur,
  onApplySuggestedSlug,
  activeField,
  onActiveFieldChange
}: Props) {
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
              title={isTemplate ? "Create a copy from this template" : "Duplicate this project"}
            >
              <Copy className="h-4 w-4" />
              {isTemplate ? "Start Copy" : "Duplicate"}
            </button>
            {formState.id && !isTemplate ? (
              <button
                type="button"
                onClick={handleDeleteClick}
                disabled={working}
                className="control-pill text-error hover:border-error/40"
              >
                <Trash2 className="h-4 w-4" />
                Delete
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
              {isTemplate
                ? isDirty
                  ? "Create Project"
                  : "Use Template"
                : isDirty
                  ? "Save Changes"
                  : "Save Project"}
            </button>
          </div>
        </div>
        {isTemplate ? (
          <p className="mt-4 rounded-[1rem] border border-accent/20 bg-accent/5 px-4 py-3 text-xs leading-6 text-muted">
            This is a permanent starter template. Saving creates a new project
            from your current edits and leaves the template untouched.
          </p>
        ) : null}

        {/* Title + Slug */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <EditorFieldShell
            fieldKey="title"
            activeField={activeField}
            onActiveFieldChange={onActiveFieldChange}
          >
            <label className="space-y-2 text-sm text-muted">
              <FieldLabel fieldKey="title" required />
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
          </EditorFieldShell>
          <EditorFieldShell
            fieldKey="slug"
            activeField={activeField}
            onActiveFieldChange={onActiveFieldChange}
          >
            <label className="space-y-2 text-sm text-muted">
              <FieldLabel fieldKey="slug" required />
              <input
                required
                value={formState.slug}
                onBlur={onSlugBlur}
                onChange={(e) => updateField("slug", slugify(e.target.value))}
                aria-invalid={slugValidation.status === "conflict"}
                aria-describedby={
                  slugValidation.status === "conflict"
                    ? "project-slug-error"
                    : undefined
                }
                className={cn(
                  "input-field",
                  slugValidation.status === "conflict" ? "field-error" : ""
                )}
              />
              {slugValidation.status === "checking" ? (
                <p className="text-xs leading-6 text-muted">
                  Checking slug availability...
                </p>
              ) : null}
              {slugValidation.status === "available" &&
              slugValidation.slug === formState.slug ? (
                <p className="text-xs leading-6 text-success">Slug is available.</p>
              ) : null}
              {slugValidation.status === "conflict" &&
              slugValidation.message ? (
                <div className="space-y-2">
                  <FieldError
                    id="project-slug-error"
                    message={slugValidation.message}
                  />
                  {slugValidation.suggestedSlug ? (
                    <button
                      type="button"
                      onClick={onApplySuggestedSlug}
                      className="inline-flex items-center gap-1.5 text-xs uppercase tracking-eyebrow text-accent hover:underline"
                    >
                      Use suggestion: {slugValidation.suggestedSlug}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </label>
          </EditorFieldShell>
        </div>

        {/* Category + meta */}
        <div className="mt-4 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <EditorFieldShell
            fieldKey="business"
            activeField={activeField}
            onActiveFieldChange={onActiveFieldChange}
          >
            <label className="space-y-2 text-sm text-muted">
              <FieldLabel fieldKey="business" />
              <input
                list="project-business-options"
                value={formState.business}
                onChange={(e) =>
                  updateField(
                    "business",
                    e.target.value as ProjectFormState["business"]
                  )
                }
                className="input-field"
                placeholder="Automotive, Hospitality, Event..."
              />
              <datalist id="project-business-options">
                {businesses.map((business) => (
                  <option key={business} value={business}>
                    {business}
                  </option>
                ))}
              </datalist>
            </label>
          </EditorFieldShell>
          <EditorFieldShell
            fieldKey="category"
            activeField={activeField}
            onActiveFieldChange={onActiveFieldChange}
          >
            <label className="space-y-2 text-sm text-muted">
              <FieldLabel fieldKey="category" />
              <input
                list="project-category-options"
                value={formState.category}
                onChange={(e) => {
                  updateField("category", e.target.value);
                  updateField("carModel", e.target.value);
                }}
                className="input-field"
                placeholder="Campaign type, format, product, or occasion"
              />
              <datalist id="project-category-options">
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </datalist>
            </label>
          </EditorFieldShell>
          <EditorFieldShell
            fieldKey="location"
            activeField={activeField}
            onActiveFieldChange={onActiveFieldChange}
          >
            <label className="space-y-2 text-sm text-muted">
              <FieldLabel fieldKey="location" required />
              <input
                value={formState.location}
                onChange={(e) => updateField("location", e.target.value)}
                className="input-field"
              />
            </label>
          </EditorFieldShell>
          <EditorFieldShell
            fieldKey="year"
            activeField={activeField}
            onActiveFieldChange={onActiveFieldChange}
          >
            <label className="space-y-2 text-sm text-muted">
              <FieldLabel fieldKey="year" required />
              <input
                value={formState.year}
                onChange={(e) => updateField("year", e.target.value)}
                className="input-field"
              />
            </label>
          </EditorFieldShell>
        </div>

        {/* Descriptions */}
        <EditorFieldShell
          fieldKey="shortDescription"
          activeField={activeField}
          onActiveFieldChange={onActiveFieldChange}
          className="mt-4"
        >
          <label className="block space-y-2 text-sm text-muted">
            <FieldLabel fieldKey="shortDescription" required />
            <textarea
              value={formState.shortDescription}
              onChange={(e) => updateField("shortDescription", e.target.value)}
              className="textarea-field min-h-28"
            />
          </label>
        </EditorFieldShell>

        <EditorFieldShell
          fieldKey="fullDescription"
          activeField={activeField}
          onActiveFieldChange={onActiveFieldChange}
          className="mt-4"
        >
          <label className="block space-y-2 text-sm text-muted">
            <FieldLabel fieldKey="fullDescription" required />
            <textarea
              value={formState.fullDescription}
              onChange={(e) => updateField("fullDescription", e.target.value)}
              className="textarea-field min-h-40"
            />
          </label>
        </EditorFieldShell>

        <EditorFieldShell
          fieldKey="behindTheScenes"
          activeField={activeField}
          onActiveFieldChange={onActiveFieldChange}
          className="mt-4"
        >
          <label className="block space-y-2 text-sm text-muted">
            <FieldLabel fieldKey="behindTheScenes" />
            <textarea
              value={formState.behindTheScenes}
              onChange={(e) => updateField("behindTheScenes", e.target.value)}
              className="textarea-field min-h-28"
            />
          </label>
        </EditorFieldShell>

        {/* Cover image */}
        <EditorFieldShell
          fieldKey="coverImage"
          activeField={activeField}
          onActiveFieldChange={onActiveFieldChange}
          className="mt-4"
        >
          <div className="space-y-2 text-sm text-muted">
            <FieldLabel fieldKey="coverImage" required />
            <div className="flex gap-4">
              {coverPreviewSrc ? (
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[1rem] border border-line bg-panel-dark">
                  <Image
                    src={coverPreviewSrc}
                    alt="Cover preview"
                    fill
                    sizes="80px"
                    unoptimized
                    className="object-cover"
                  />
                </div>
              ) : null}
              <div className="flex-1 space-y-2">
                <input
                  value={formState.coverImage}
                  onChange={(e) => {
                    setCoverFile(null);
                    updateField("coverImage", e.target.value);
                  }}
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
                  <p className="text-xs text-muted">
                    Queued: {coverFile.name}. The admin preview updates
                    immediately; the public site changes after you save.
                  </p>
                ) : null}
              </div>
            </div>
            <p className="text-xs leading-6 text-muted">
              This image stays separate from the gallery. It drives the top hero
              on the project page, the video poster, and the project cards.
            </p>
          </div>
        </EditorFieldShell>

        {/* Gallery — visual grid editor */}
        <EditorFieldShell
          fieldKey="gallery"
          activeField={activeField}
          onActiveFieldChange={onActiveFieldChange}
          className="mt-4"
        >
          <div className="space-y-2 text-sm text-muted">
            <FieldLabel fieldKey="gallery" required />
            <p className="text-xs leading-6 text-muted">
              Order matters: frame 01 is used as the{" "}
              {getGalleryFrameRole(0).label.toLowerCase()} below the narrative.
              Frame 02+ appear lower on the page as supporting stills.
            </p>
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
        </EditorFieldShell>

        {/* Video */}
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <EditorFieldShell
            fieldKey="video"
            activeField={activeField}
            onActiveFieldChange={onActiveFieldChange}
          >
            <label className="space-y-2 text-sm text-muted">
              <FieldLabel fieldKey="video">
                Video URL
                {formState.videoUrl && !formState.uploadedVideo && !videoFile
                  ? " · active"
                  : ""}
              </FieldLabel>
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
          </EditorFieldShell>
          <EditorFieldShell
            fieldKey="video"
            activeField={activeField}
            onActiveFieldChange={onActiveFieldChange}
          >
            <div className="space-y-2 text-sm text-muted">
              <FieldLabel fieldKey="video">
                Uploaded video
                {formState.uploadedVideo || videoFile ? " · active" : ""}
              </FieldLabel>
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
          </EditorFieldShell>
        </div>

        {/* Publish settings */}
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {/* Datepicker for createdAt */}
          <EditorFieldShell
            fieldKey="createdAt"
            activeField={activeField}
            onActiveFieldChange={onActiveFieldChange}
          >
            <div className="space-y-2 text-sm text-muted">
              <FieldLabel fieldKey="createdAt" />
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
          </EditorFieldShell>
          <EditorFieldShell
            fieldKey="featured"
            activeField={activeField}
            onActiveFieldChange={onActiveFieldChange}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <FieldLabel fieldKey="featured" />
              </div>
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
          </EditorFieldShell>
          <EditorFieldShell
            fieldKey="published"
            activeField={activeField}
            onActiveFieldChange={onActiveFieldChange}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <FieldLabel fieldKey="published" />
              </div>
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
          </EditorFieldShell>
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
            {formState.id && !isTemplate ? (
              <button
                type="button"
                onClick={handleDeleteClick}
                disabled={working}
                className="control-pill text-error hover:border-error/40"
              >
                <Trash2 className="h-4 w-4" />
                Delete
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
              {isTemplate
                ? isDirty
                  ? "Create Project"
                  : "Use Template"
                : isDirty
                  ? "Save Changes"
                  : "Save Project"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
