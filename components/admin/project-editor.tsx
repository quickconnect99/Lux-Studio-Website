"use client";

import type { ChangeEvent } from "react";
import {
  AlertCircle,
  CloudUpload,
  Copy,
  ExternalLink,
  RefreshCw,
  Trash2
} from "lucide-react";
import { ProjectEditorBasicsPanel } from "@/components/admin/project-editor-basics-panel";
import { ProjectEditorMediaPanel } from "@/components/admin/project-editor-media-panel";
import { ProjectEditorPublishPanel } from "@/components/admin/project-editor-publish-panel";
import type {
  AdminUploadProgress,
  AdminProjectFieldKey,
  ProjectFormState,
  SlugValidationState
} from "@/lib/admin-types";

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
  altRawLines: string[];
  uploadProgress: AdminUploadProgress | null;
  slugValidation: SlugValidationState;
  onSlugBlur: () => void;
  onApplySuggestedSlug: () => void;
  activeField: AdminProjectFieldKey | null;
  onActiveFieldChange: (field: AdminProjectFieldKey | null) => void;
};

const editorSections: [AdminProjectFieldKey, string][] = [
  ["title", "01 Basics"],
  ["shortDescription", "02 Copy"],
  ["coverImage", "03 Media"],
  ["gallery", "04 Gallery"],
  ["published", "05 Publishing"]
];

/**
 * Orchestrates every editable project field and the queued-media controls.
 *
 * The component is controlled: values arrive through `formState`, and every
 * edit is reported through callbacks. It does not upload or save on its own.
 * Keeping persistence outside this large form lets the editor, sidebar, and
 * live preview share one authoritative state. The actual fields live in
 * fachliche panels (Basics, Media, Publish); this file owns only the shared
 * chrome — status header, section nav, and the sticky save bar — that spans
 * all of them.
 */
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
  altRawLines,
  uploadProgress,
  slugValidation,
  onSlugBlur,
  onApplySuggestedSlug,
  activeField,
  onActiveFieldChange
}: Props) {
  function navigateToField(field: AdminProjectFieldKey) {
    onActiveFieldChange(field);
    document
      .querySelector<HTMLElement>(`[data-admin-editor-field="${field}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
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
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-accent-text" />
                  <span className="text-accent-text">
                    Uploading {uploadProgress.current} / {uploadProgress.total}
                    {" · "}
                    {uploadProgress.filename}
                  </span>
                </>
              ) : isDirty ? (
                <>
                  <AlertCircle className="h-3.5 w-3.5 text-warning-text" />
                  <span className="text-warning-text">
                    Unsaved changes · Ctrl+S to save
                  </span>
                </>
              ) : (
                <span className="text-muted">No unsaved changes.</span>
              )}
            </p>
            <p className="mt-1 text-xs text-muted">
              <span className="text-error-text">*</span> Required field
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={duplicateProject}
              disabled={working}
              className="control-pill"
              title={
                isTemplate
                  ? "Create a copy from this template"
                  : "Duplicate this project"
              }
            >
              <Copy className="h-4 w-4" />
              {isTemplate ? "Start Copy" : "Duplicate"}
            </button>
          </div>
        </div>
        {isTemplate ? (
          <p className="border-accent/20 bg-accent/5 mt-4 rounded-[1rem] border px-4 py-3 text-xs leading-6 text-muted">
            This is a permanent starter template. Saving creates a new project
            from your current edits and leaves the template untouched.
          </p>
        ) : null}

        <nav
          aria-label="Project editor sections"
          className="no-scrollbar mt-5 flex gap-2 overflow-x-auto border-y border-line py-3"
        >
          {editorSections.map(([field, label]) => (
            <button
              key={field}
              type="button"
              onClick={() => navigateToField(field)}
              className="min-h-10 shrink-0 rounded-full border border-line bg-panel-secondary px-3 text-xs uppercase tracking-eyebrow text-muted transition-colors hover:border-accent hover:text-foreground"
            >
              {label}
            </button>
          ))}
        </nav>

        <ProjectEditorBasicsPanel
          formState={formState}
          updateField={updateField}
          slugValidation={slugValidation}
          onSlugBlur={onSlugBlur}
          onApplySuggestedSlug={onApplySuggestedSlug}
          activeField={activeField}
          onActiveFieldChange={onActiveFieldChange}
        />

        <ProjectEditorMediaPanel
          galleryKey={galleryKey}
          formState={formState}
          updateField={updateField}
          handleFileSelection={handleFileSelection}
          addGalleryFiles={addGalleryFiles}
          removeGalleryFile={removeGalleryFile}
          coverFile={coverFile}
          coverPreviewSrc={coverPreviewSrc}
          setCoverFile={setCoverFile}
          videoFile={videoFile}
          setVideoFile={setVideoFile}
          galleryFiles={galleryFiles}
          galleryImageList={galleryImageList}
          captionRawLines={captionRawLines}
          altRawLines={altRawLines}
          activeField={activeField}
          onActiveFieldChange={onActiveFieldChange}
        />

        <ProjectEditorPublishPanel
          formState={formState}
          updateField={updateField}
          activeField={activeField}
          onActiveFieldChange={onActiveFieldChange}
        />
      </form>

      {/* Sticky save bar */}
      <div
        data-admin-project-actions
        className="mt-4 sm:sticky sm:bottom-4 sm:z-20"
      >
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
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-eyebrow text-accent-text hover:underline"
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
                className="control-pill hover:border-error/40 text-error-text"
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
