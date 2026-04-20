"use client";

import {
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
  useEffect,
  useRef,
  useState
} from "react";
import Image from "next/image";
import { PenSquare } from "lucide-react";
import type { ProjectFormState } from "@/lib/admin-types";
import { businesses, categories } from "@/lib/admin-utils";
import { getProjectPrimaryMetaLabel } from "@/lib/project-business";
import { cn } from "@/lib/utils";

export type PreviewEditableField =
  | "business"
  | "title"
  | "slug"
  | "category"
  | "shortDescription"
  | "fullDescription"
  | "carModel"
  | "location"
  | "year"
  | "behindTheScenes"
  | "coverImage"
  | "videoUrl"
  | "uploadedVideo"
  | "createdAt";

export type PreviewToggleField = "published" | "featured";

type LivePreviewProps = {
  formState: ProjectFormState;
  isDirty: boolean;
  galleryImageList: string[];
  captionRawLines: string[];
  onUpdateField: (field: PreviewEditableField, value: string) => void;
  onUpdateCaption: (index: number, value: string) => void;
  onReplaceGalleryImage: (index: number, value: string) => void;
  onToggleField: (field: PreviewToggleField) => void;
};

type EditablePreviewFieldProps = {
  fieldKey: PreviewEditableField;
  value: string;
  placeholder: string;
  onCommit: (field: PreviewEditableField, value: string) => void;
  kind?: "input" | "textarea" | "select";
  options?: string[];
  rows?: number;
  wrapperClassName?: string;
  displayClassName?: string;
  inputClassName?: string;
  emptyClassName?: string;
};

function EditablePreviewField({
  fieldKey,
  value,
  placeholder,
  onCommit,
  kind = "input",
  options = [],
  rows = 4,
  wrapperClassName,
  displayClassName,
  inputClassName,
  emptyClassName
}: EditablePreviewFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null
  >(null);

  useEffect(() => {
    if (!isEditing) return;

    const node = inputRef.current;
    if (!node) return;

    requestAnimationFrame(() => {
      node.focus();
      if (
        node instanceof HTMLInputElement ||
        node instanceof HTMLTextAreaElement
      ) {
        node.select();
      }
    });
  }, [isEditing]);

  function openEditor() {
    setDraft(value);
    setIsEditing(true);
  }

  function commit(nextValue = draft) {
    onCommit(fieldKey, nextValue.trim());
    setIsEditing(false);
  }

  function cancel() {
    setDraft(value);
    setIsEditing(false);
  }

  function handleKeyDown(
    event: ReactKeyboardEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    if (event.key === "Escape") {
      event.preventDefault();
      cancel();
      return;
    }

    if (kind !== "textarea" && event.key === "Enter") {
      event.preventDefault();
      commit();
      return;
    }

    if (
      kind === "textarea" &&
      event.key === "Enter" &&
      (event.metaKey || event.ctrlKey)
    ) {
      event.preventDefault();
      commit();
    }
  }

  if (isEditing) {
    if (kind === "textarea") {
      return (
        <div className={wrapperClassName}>
          <textarea
            ref={inputRef as RefObject<HTMLTextAreaElement>}
            value={draft}
            rows={rows}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={() => commit()}
            onKeyDown={handleKeyDown}
            className={cn(
              "textarea-field min-h-[7rem] w-full resize-none text-sm leading-7",
              inputClassName
            )}
          />
        </div>
      );
    }

    if (kind === "select") {
      return (
        <div className={wrapperClassName}>
          <select
            ref={inputRef as RefObject<HTMLSelectElement>}
            value={draft}
            onChange={(event) => {
              const nextValue = event.target.value;
              setDraft(nextValue);
              commit(nextValue);
            }}
            onBlur={() => setIsEditing(false)}
            onKeyDown={handleKeyDown}
            className={cn("input-field w-full text-sm", inputClassName)}
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div className={wrapperClassName}>
        <input
          ref={inputRef as RefObject<HTMLInputElement>}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => commit()}
          onKeyDown={handleKeyDown}
          className={cn("input-field w-full text-sm", inputClassName)}
        />
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onDoubleClick={openEditor}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openEditor();
        }
      }}
      title="Double-click to edit"
      className={cn(
        "cursor-text rounded-xl border border-transparent transition-colors",
        "hover:border-line/80 hover:bg-panel-secondary/60",
        "focus-visible:bg-panel-secondary/60 focus-visible:border-accent focus-visible:outline-none",
        wrapperClassName
      )}
    >
      <span
        className={cn(
          value ? "text-current" : "text-muted/75 italic",
          value ? displayClassName : (emptyClassName ?? displayClassName)
        )}
      >
        {value || placeholder}
      </span>
    </div>
  );
}

type PreviewToggleChipProps = {
  active: boolean;
  label: string;
  onClick: () => void;
  activeClassName: string;
  inactiveClassName: string;
};

function PreviewToggleChip({
  active,
  label,
  onClick,
  activeClassName,
  inactiveClassName
}: PreviewToggleChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-2.5 py-1 text-[0.6rem] uppercase tracking-eyebrow backdrop-blur-sm transition-colors",
        active ? activeClassName : inactiveClassName
      )}
    >
      {label}
    </button>
  );
}

export function LivePreview({
  formState,
  isDirty,
  galleryImageList,
  captionRawLines,
  onUpdateField,
  onUpdateCaption,
  onReplaceGalleryImage,
  onToggleField
}: LivePreviewProps) {
  const primaryMetaLabel = getProjectPrimaryMetaLabel(formState.business);

  return (
    <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
      <div className="panel-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-eyebrow text-muted">
              Quick Preview
            </p>
            <p className="mt-1 text-xs leading-6 text-muted">
              Double-click any text to edit it directly in the preview.
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-panel-secondary text-muted">
            <PenSquare className="h-4 w-4" />
          </div>
        </div>

        <div className="relative min-h-[240px] bg-panel-dark">
          {formState.coverImage ? (
            <Image
              src={formState.coverImage}
              alt={formState.title || "Project preview"}
              fill
              sizes="360px"
              className="object-cover"
            />
          ) : null}
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-1.5 p-3">
            <PreviewToggleChip
              active={formState.published}
              label={formState.published ? "Published" : "Draft"}
              onClick={() => onToggleField("published")}
              activeClassName="bg-success/20 text-success"
              inactiveClassName="bg-foreground/50 text-background/70"
            />
            <PreviewToggleChip
              active={formState.featured}
              label="Featured"
              onClick={() => onToggleField("featured")}
              activeClassName="bg-accent/20 text-accent"
              inactiveClassName="bg-black/35 text-white/75"
            />
            {isDirty ? (
              <span className="bg-warning/20 rounded-full px-2.5 py-1 text-[0.6rem] uppercase tracking-eyebrow text-warning backdrop-blur-sm">
                Unsaved
              </span>
            ) : null}
          </div>
        </div>

        <div className="space-y-5 p-5">
          <EditablePreviewField
            fieldKey="business"
            value={formState.business}
            placeholder="Project business"
            kind="select"
            options={businesses}
            onCommit={onUpdateField}
            wrapperClassName="-mx-2 -my-1 px-2 py-1"
            displayClassName="text-[0.62rem] uppercase tracking-[0.28em] text-accent"
          />

          <EditablePreviewField
            fieldKey="category"
            value={formState.category}
            placeholder="Project category"
            kind="select"
            options={categories}
            onCommit={onUpdateField}
            wrapperClassName="-mx-2 -my-1 px-2 py-1"
            displayClassName="text-[0.62rem] uppercase tracking-[0.28em] text-muted"
          />

          <EditablePreviewField
            fieldKey="title"
            value={formState.title}
            placeholder="Project title"
            onCommit={onUpdateField}
            wrapperClassName="-mx-2 -my-2 px-2 py-2"
            displayClassName="font-[family:var(--font-display)] text-3xl uppercase leading-[0.9] text-foreground"
            inputClassName="font-[family:var(--font-display)] text-2xl uppercase tracking-tight"
          />

          <EditablePreviewField
            fieldKey="shortDescription"
            value={formState.shortDescription}
            placeholder="Short description will appear here."
            kind="textarea"
            rows={4}
            onCommit={onUpdateField}
            wrapperClassName="-mx-2 -my-1 px-2 py-2"
            displayClassName="text-sm leading-7 text-muted"
            inputClassName="min-h-[7.5rem]"
          />

          <div className="space-y-1">
            <p className="text-[0.58rem] uppercase tracking-[0.28em] text-muted">
              Slug
            </p>
            <EditablePreviewField
              fieldKey="slug"
              value={formState.slug}
              placeholder="new-project"
              onCommit={onUpdateField}
              wrapperClassName="-mx-2 px-2 py-1"
              displayClassName="block text-[0.72rem] uppercase tracking-[0.22em] text-muted"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="metadata-card">
              <p className="metadata-label">{primaryMetaLabel}</p>
              <EditablePreviewField
                fieldKey="carModel"
                value={formState.carModel}
                placeholder="TBD"
                onCommit={onUpdateField}
                wrapperClassName="-mx-2 mt-1 px-2 py-1"
                displayClassName="block text-xs uppercase tracking-wide text-foreground"
              />
            </div>
            <div className="metadata-card">
              <p className="metadata-label">Location</p>
              <EditablePreviewField
                fieldKey="location"
                value={formState.location}
                placeholder="TBD"
                onCommit={onUpdateField}
                wrapperClassName="-mx-2 mt-1 px-2 py-1"
                displayClassName="block text-xs uppercase tracking-wide text-foreground"
              />
            </div>
            <div className="metadata-card">
              <p className="metadata-label">Year</p>
              <EditablePreviewField
                fieldKey="year"
                value={formState.year}
                placeholder="TBD"
                onCommit={onUpdateField}
                wrapperClassName="-mx-2 mt-1 px-2 py-1"
                displayClassName="block text-xs uppercase tracking-wide text-foreground"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="panel-2xl p-5">
        <p className="text-xs uppercase tracking-eyebrow text-muted">
          Narrative
        </p>
        <EditablePreviewField
          fieldKey="fullDescription"
          value={formState.fullDescription}
          placeholder="Full project narrative."
          kind="textarea"
          rows={6}
          onCommit={onUpdateField}
          wrapperClassName="-mx-2 mt-3 px-2 py-2"
          displayClassName="text-sm leading-7 text-muted"
          inputClassName="min-h-[10rem]"
        />
      </div>

      <div className="panel-2xl p-5">
        <p className="text-xs uppercase tracking-eyebrow text-muted">
          Project Meta
        </p>
        <div className="mt-4 space-y-4">
          <div>
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
          </div>

          <div>
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
          </div>

          <div>
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
          </div>

          <div>
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
          </div>
        </div>
      </div>

      <div className="panel-2xl p-5">
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
      </div>

      {galleryImageList.length > 0 ? (
        <div className="panel-2xl p-4">
          <p className="mb-3 text-[0.6rem] uppercase tracking-eyebrow text-muted">
            Gallery ({galleryImageList.length}{" "}
            {galleryImageList.length === 1 ? "frame" : "frames"})
          </p>
          <div className="space-y-4">
            {galleryImageList.map((src, index) => (
              <div
                key={`${src}-${index}`}
                className="rounded-[1.25rem] border border-line bg-panel-secondary p-3"
              >
                <div className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-line bg-panel-dark">
                    <Image
                      src={src}
                      alt={`Frame ${index + 1}`}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-3">
                    <div>
                      <p className="text-[0.58rem] uppercase tracking-[0.28em] text-muted">
                        Frame 0{index + 1} image
                      </p>
                      <EditablePreviewField
                        fieldKey="coverImage"
                        value={src}
                        placeholder="/images/frame.jpg"
                        onCommit={(_, value) =>
                          onReplaceGalleryImage(index, value)
                        }
                        wrapperClassName="-mx-2 mt-1 px-2 py-1"
                        displayClassName="block break-all text-xs leading-6 text-muted"
                      />
                    </div>

                    <div>
                      <p className="text-[0.58rem] uppercase tracking-[0.28em] text-muted">
                        Frame 0{index + 1} caption
                      </p>
                      <EditablePreviewField
                        fieldKey="behindTheScenes"
                        value={captionRawLines[index] ?? ""}
                        placeholder="Add a caption for this frame."
                        kind="textarea"
                        rows={3}
                        onCommit={(_, value) => onUpdateCaption(index, value)}
                        wrapperClassName="-mx-2 mt-1 px-2 py-1"
                        displayClassName="block whitespace-pre-wrap text-sm leading-6 text-muted"
                        inputClassName="min-h-[6rem]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </aside>
  );
}
