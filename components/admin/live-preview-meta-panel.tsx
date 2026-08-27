"use client";

import {
  EditablePreviewField,
  type PreviewEditableField
} from "@/components/admin/live-preview-field-controls";
import { PreviewFieldShell } from "@/components/admin/field-highlight-shell";
import type { AdminProjectFieldKey, ProjectFormState } from "@/lib/admin-types";
import { resolveVideoSource } from "@/lib/video";

type Props = {
  formState: ProjectFormState;
  activeField: AdminProjectFieldKey | null;
  onActiveFieldChange: (field: AdminProjectFieldKey | null) => void;
  onUpdateField: (field: PreviewEditableField, value: string) => void;
};

/**
 * Secondary project metadata — cover path, publish date, video sources, and
 * production notes — that supports the hero card without appearing in it.
 */
export function LivePreviewMetaPanel({
  formState,
  activeField,
  onActiveFieldChange,
  onUpdateField
}: Props) {
  // Mirrors the public page's precedence (lib/video.ts#getProjectVideoSource):
  // an uploaded file wins over an embedded provider URL.
  const publicVideoSource = resolveVideoSource(
    formState.uploadedVideo || formState.videoUrl
  );

  return (
    <>
      <div className="panel-2xl p-5">
        <p className="text-xs uppercase tracking-eyebrow text-muted">
          Project Meta
        </p>
        <div className="mt-4 space-y-4">
          <PreviewFieldShell
            fieldKey="coverImage"
            activeField={activeField}
            onActiveFieldChange={onActiveFieldChange}
          >
            <p className="text-[0.58rem] uppercase tracking-[0.28em] text-muted">
              Cover image path
            </p>
            <EditablePreviewField
              fieldKey="coverImage"
              value={formState.coverImage}
              placeholder="/images/cover.jpg"
              onCommit={onUpdateField}
              wrapperClassName="-mx-2 mt-1 px-2 py-1"
              displayClassName="block break-all text-sm leading-6 text-muted"
            />
          </PreviewFieldShell>

          <PreviewFieldShell
            fieldKey="createdAt"
            activeField={activeField}
            onActiveFieldChange={onActiveFieldChange}
          >
            <p className="text-[0.58rem] uppercase tracking-[0.28em] text-muted">
              Created at
            </p>
            <EditablePreviewField
              fieldKey="createdAt"
              value={formState.createdAt}
              placeholder="2026-01-01T00:00:00.000Z"
              onCommit={onUpdateField}
              wrapperClassName="-mx-2 mt-1 px-2 py-1"
              displayClassName="block break-all text-sm leading-6 text-muted"
            />
          </PreviewFieldShell>

          <PreviewFieldShell
            fieldKey="video"
            activeField={activeField}
            onActiveFieldChange={onActiveFieldChange}
          >
            <p className="text-[0.58rem] uppercase tracking-[0.28em] text-muted">
              Video URL
            </p>
            <EditablePreviewField
              fieldKey="videoUrl"
              value={formState.videoUrl}
              placeholder="YouTube, Vimeo, or direct MP4 URL"
              onCommit={onUpdateField}
              wrapperClassName="-mx-2 mt-1 px-2 py-1"
              displayClassName="block break-all text-sm leading-6 text-muted"
            />
          </PreviewFieldShell>

          <PreviewFieldShell
            fieldKey="video"
            activeField={activeField}
            onActiveFieldChange={onActiveFieldChange}
          >
            <p className="text-[0.58rem] uppercase tracking-[0.28em] text-muted">
              Uploaded video
            </p>
            <EditablePreviewField
              fieldKey="uploadedVideo"
              value={formState.uploadedVideo}
              placeholder="/media/project-reel.mp4"
              onCommit={onUpdateField}
              wrapperClassName="-mx-2 mt-1 px-2 py-1"
              displayClassName="block break-all text-sm leading-6 text-muted"
            />
          </PreviewFieldShell>

          <p className="text-[0.62rem] uppercase tracking-eyebrow text-muted">
            Public playback:{" "}
            <span className="text-foreground">
              {publicVideoSource
                ? publicVideoSource.label
                : "None configured, cover image shown instead"}
            </span>
          </p>
        </div>
      </div>

      <PreviewFieldShell
        fieldKey="behindTheScenes"
        activeField={activeField}
        onActiveFieldChange={onActiveFieldChange}
        className="panel-2xl p-5"
      >
        <p className="text-xs uppercase tracking-eyebrow text-muted">
          Behind The Scenes
        </p>
        <EditablePreviewField
          fieldKey="behindTheScenes"
          value={formState.behindTheScenes}
          placeholder="Add a production note, crew choice, or technical detail."
          kind="textarea"
          rows={4}
          onCommit={onUpdateField}
          wrapperClassName="-mx-2 mt-3 px-2 py-2"
          displayClassName="text-sm leading-7 text-muted"
        />
      </PreviewFieldShell>
    </>
  );
}
