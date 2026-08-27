"use client";

import type { ChangeEvent } from "react";
import { ResilientImage as Image } from "@/components/ui/resilient-image";
import { GalleryEditor } from "@/components/admin/gallery-editor";
import { EditorFieldShell } from "@/components/admin/field-highlight-shell";
import { FieldLabel } from "@/components/admin/project-editor-field-controls";
import { getGalleryFrameRole } from "@/lib/admin-project-fields";
import type { AdminProjectFieldKey, ProjectFormState } from "@/lib/admin-types";

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
  addGalleryFiles: (files: File[]) => void;
  removeGalleryFile: (index: number) => void;
  coverFile: File | null;
  coverPreviewSrc: string;
  setCoverFile: (file: File | null) => void;
  videoFile: File | null;
  setVideoFile: (file: File | null) => void;
  galleryFiles: File[];
  galleryImageList: string[];
  captionRawLines: string[];
  altRawLines: string[];
  activeField: AdminProjectFieldKey | null;
  onActiveFieldChange: (field: AdminProjectFieldKey | null) => void;
};

/**
 * Cover image, ordered gallery, and the two video source fields — every
 * queued-media control for the project.
 */
export function ProjectEditorMediaPanel({
  galleryKey,
  formState,
  updateField,
  handleFileSelection,
  addGalleryFiles,
  removeGalleryFile,
  coverFile,
  coverPreviewSrc,
  setCoverFile,
  videoFile,
  setVideoFile,
  galleryFiles,
  galleryImageList,
  captionRawLines,
  altRawLines,
  activeField,
  onActiveFieldChange
}: Props) {
  function handleGalleryChange(
    images: string[],
    captions: string[],
    alts: string[] = []
  ) {
    updateField("galleryImagesText", images.join("\n"));
    updateField("galleryCaptionsText", captions.join("\n"));
    updateField("galleryAltsText", alts.join("\n"));
  }

  return (
    <>
      {/* Cover image */}
      <div
        data-admin-editor-section="media"
        className="mt-8 border-l-2 border-accent pl-3"
      >
        <p className="text-xs font-medium uppercase tracking-eyebrow text-foreground">
          03 · Media
        </p>
        <p className="mt-1 text-sm text-muted">
          Cover image and project video sources.
        </p>
      </div>

      <EditorFieldShell
        fieldKey="coverImage"
        activeField={activeField}
        onActiveFieldChange={onActiveFieldChange}
        className="mt-4"
      >
        <div className="space-y-2 text-sm text-muted">
          <FieldLabel fieldKey="coverImage" required />
          <div className="flex flex-col gap-4 sm:flex-row">
            {coverPreviewSrc ? (
              <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-[1rem] border border-line bg-panel-dark sm:h-20 sm:w-20">
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
                aria-label="Upload project cover image"
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
      <div
        data-admin-editor-section="gallery"
        className="mt-8 border-l-2 border-accent pl-3"
      >
        <p className="text-xs font-medium uppercase tracking-eyebrow text-foreground">
          04 · Gallery
        </p>
        <p className="mt-1 text-sm text-muted">
          Reorder project stills and maintain their captions.
        </p>
      </div>

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
            alts={altRawLines}
            showAlts
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
              aria-label="Uploaded video URL"
              onChange={(e) => {
                updateField("uploadedVideo", e.target.value);
                if (e.target.value) updateField("videoUrl", "");
              }}
              className="input-field"
            />
            <input
              type="file"
              accept="video/*"
              aria-label="Upload project video"
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
    </>
  );
}
