"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ResilientImage as Image } from "@/components/ui/resilient-image";
import { ChevronDown, ChevronUp, GripVertical, Plus, X } from "lucide-react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getGalleryFrameRole } from "@/lib/admin-project-fields";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────

type GalleryItem = { id: string; image: string; caption: string };

type GalleryEditorProps = {
  images: string[];
  captions: string[];
  pendingFiles: File[];
  onImagesChange: (images: string[], captions: string[]) => void;
  onFilesAdd: (files: File[]) => void;
  onFileRemove: (index: number) => void;
  introText?: string;
  captionPlaceholder?: (index: number) => string;
  showCaptions?: boolean;
  showAddControls?: boolean;
  itemLabel?: string;
  getFrameRole?: (index: number) => {
    label: string;
    description: string;
  };
};

// ── Sortable row ─────────────────────────────────────────────────────────────

type SortableItemProps = {
  item: GalleryItem;
  displayIndex: number;
  roleLabel: string;
  roleDescription: string;
  captionPlaceholder: string;
  showCaption: boolean;
  itemLabel: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onImageChange: (value: string) => void;
  onCaptionChange: (value: string) => void;
};

function SortableItem({
  item,
  displayIndex,
  roleLabel,
  roleDescription,
  captionPlaceholder,
  showCaption,
  itemLabel,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onRemove,
  onImageChange,
  onCaptionChange
}: SortableItemProps) {
  const [imageDraft, setImageDraft] = useState(item.image);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  function commitImagePath() {
    const nextImage = imageDraft.trim();
    if (!nextImage) {
      setImageDraft(item.image);
      return;
    }
    onImageChange(nextImage);
  }

  return (
    <div
      ref={setNodeRef}
      data-gallery-item
      style={{
        transform: CSS.Transform.toString(transform),
        transition
      }}
      className={cn(
        "grid grid-cols-[44px_minmax(0,1fr)_44px] items-start gap-2 rounded-[1.25rem] border border-line bg-panel-secondary p-3 sm:grid-cols-[44px_68px_minmax(0,1fr)_44px] sm:gap-3",
        isDragging && "z-50 opacity-75 shadow-lg"
      )}
    >
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="flex h-11 w-11 cursor-grab items-center justify-center rounded-xl text-muted hover:bg-panel hover:text-foreground active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Thumbnail */}
      <div className="relative h-16 w-16 overflow-hidden rounded-[0.875rem] border border-line bg-panel-dark">
        <Image
          src={item.image}
          alt={`${itemLabel} ${displayIndex + 1}`}
          fill
          sizes="64px"
          className="object-cover"
        />
        <span className="absolute bottom-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/70 text-[0.48rem] font-medium text-white">
          {displayIndex + 1}
        </span>
      </div>

      {/* Image path and caption */}
      <div className="col-span-3 row-start-2 space-y-2 sm:col-span-1 sm:row-start-auto">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[0.58rem] uppercase tracking-[0.28em] text-muted">
            {itemLabel} {String(displayIndex + 1).padStart(2, "0")}
          </p>
          <span className="border-accent/30 bg-accent/10 rounded-full border px-2 py-1 text-[0.55rem] uppercase tracking-[0.24em] text-accent-text">
            {roleLabel}
          </span>
        </div>
        <p className="text-[0.7rem] leading-5 text-muted">{roleDescription}</p>
        <div className="flex gap-2 sm:hidden">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="control-pill min-h-10 flex-1 justify-center disabled:opacity-40"
          >
            <ChevronUp className="h-4 w-4" />
            Move up
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="control-pill min-h-10 flex-1 justify-center disabled:opacity-40"
          >
            <ChevronDown className="h-4 w-4" />
            Move down
          </button>
        </div>
        <input
          data-gallery-image-index={displayIndex}
          value={imageDraft}
          onChange={(event) => setImageDraft(event.target.value)}
          onBlur={commitImagePath}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitImagePath();
              event.currentTarget.blur();
            }
            if (event.key === "Escape") {
              setImageDraft(item.image);
              event.currentTarget.blur();
            }
          }}
          className="input-field text-xs"
          aria-label={`Image path for ${itemLabel.toLowerCase()} ${displayIndex + 1}`}
          placeholder="https://… or /images/…"
        />
        {showCaption ? (
          <textarea
            value={item.caption}
            onChange={(e) => onCaptionChange(e.target.value)}
            className="textarea-field min-h-[4rem] text-xs"
            aria-label={`Caption for ${itemLabel.toLowerCase()} ${displayIndex + 1}`}
            placeholder={captionPlaceholder}
          />
        ) : null}
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={onRemove}
        className="col-start-3 row-start-1 flex h-11 w-11 items-center justify-center rounded-xl text-muted transition-colors hover:bg-panel hover:text-error-text sm:col-start-auto sm:row-start-auto"
        aria-label={`Remove ${itemLabel.toLowerCase()} ${displayIndex + 1}`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── Pending file thumbnail ───────────────────────────────────────────────────
// Object URLs let the browser render a local file before it's ever uploaded.
function PendingThumbnail({ file }: { file: File }) {
  const [previewUrl] = useState(() => URL.createObjectURL(file));

  useEffect(() => {
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  return (
    <Image
      src={previewUrl}
      alt=""
      fill
      sizes="48px"
      unoptimized
      className="object-cover"
    />
  );
}

// ── Main component ────────────────────────────────────────────────────────────

function hashGalleryImage(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash).toString(36);
}

function buildItems(images: string[], captions: string[]): GalleryItem[] {
  const occurrences = new Map<string, number>();
  return images.map((image, index) => {
    const occurrence = occurrences.get(image) ?? 0;
    occurrences.set(image, occurrence + 1);

    return {
      id: `gallery-${hashGalleryImage(image)}-${occurrence}`,
      image,
      caption: captions[index] ?? ""
    };
  });
}

/**
 * Keeps gallery images and their captions aligned while users add or reorder
 * frames.
 *
 * Existing URLs and newly selected `File` objects are separate collections:
 * this component edits URL order immediately, while pending files are uploaded
 * later by the save workflow. `onImagesChange` always emits parallel image and
 * caption arrays in display order.
 */
export function GalleryEditor({
  images,
  captions,
  pendingFiles,
  onImagesChange,
  onFilesAdd,
  onFileRemove,
  introText = "Gallery order controls the live page: frame 01 becomes the large project image below the narrative, frame 02+ appear lower on the page.",
  captionPlaceholder = (index) => `Caption for frame ${index + 1}...`,
  showCaptions = true,
  showAddControls = true,
  itemLabel = "Frame",
  getFrameRole = getGalleryFrameRole
}: GalleryEditorProps) {
  // ── Local state — initialized from props, owns drag order ───────────────
  // The parent uses `key` to remount this component on project switch/save,
  // so we don't need a useEffect sync here.
  const items = useMemo(() => buildItems(images, captions), [captions, images]);

  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dndContextId = useId();

  const ids = useMemo(() => items.map((item) => item.id), [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  // ── Emit helper ──────────────────────────────────────────────────────────
  function emit(nextItems: GalleryItem[]) {
    const nextImages = nextItems.map((item) => item.image);
    const nextCaptions = nextItems.map((item) => item.caption);
    onImagesChange(nextImages, nextCaptions);
  }

  // ── Drag end ─────────────────────────────────────────────────────────────
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex((item) => item.id === active.id);
    const newIdx = items.findIndex((item) => item.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const next = arrayMove(items, oldIdx, newIdx);
    emit(next);
  }

  // ── Remove ───────────────────────────────────────────────────────────────
  function handleRemove(id: string) {
    const next = items.filter((item) => item.id !== id);
    emit(next);
  }

  function handleMove(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const next = arrayMove(items, index, targetIndex);
    emit(next);
  }

  // ── Caption ──────────────────────────────────────────────────────────────
  function handleCaptionChange(id: string, caption: string) {
    const next = items.map((item) =>
      item.id === id ? { ...item, caption } : item
    );
    emit(next);
  }

  function handleImageChange(id: string, image: string) {
    const next = items.map((item) =>
      item.id === id ? { ...item, image } : item
    );
    emit(next);
  }

  // ── Add URL ──────────────────────────────────────────────────────────────
  function handleAddUrl() {
    const trimmed = urlDraft.trim();
    if (!trimmed) return;
    const occurrence = items.filter((item) => item.image === trimmed).length;
    const next = [
      ...items,
      {
        id: `gallery-${hashGalleryImage(trimmed)}-${occurrence}`,
        image: trimmed,
        caption: ""
      }
    ];
    emit(next);
    setUrlDraft("");
    setShowUrlInput(false);
  }

  // ── Upload files ─────────────────────────────────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) onFilesAdd(files);
    e.target.value = "";
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-2">
      <p className="text-[0.72rem] leading-5 text-muted">{introText}</p>

      {/* Sortable image list */}
      {items.length > 0 ? (
        <DndContext
          id={dndContextId}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((item, displayIndex) =>
                (() => {
                  const role = getFrameRole(displayIndex);

                  return (
                    <SortableItem
                      key={`${item.id}:${item.image}`}
                      item={item}
                      displayIndex={displayIndex}
                      roleLabel={role.label}
                      roleDescription={role.description}
                      captionPlaceholder={captionPlaceholder(displayIndex)}
                      showCaption={showCaptions}
                      itemLabel={itemLabel}
                      canMoveUp={displayIndex > 0}
                      canMoveDown={displayIndex < items.length - 1}
                      onMoveUp={() => handleMove(displayIndex, -1)}
                      onMoveDown={() => handleMove(displayIndex, 1)}
                      onRemove={() => handleRemove(item.id)}
                      onImageChange={(value) =>
                        handleImageChange(item.id, value)
                      }
                      onCaptionChange={(v) => handleCaptionChange(item.id, v)}
                    />
                  );
                })()
              )}
            </div>
          </SortableContext>
        </DndContext>
      ) : null}

      {/* Pending upload files */}
      {pendingFiles.length > 0 ? (
        <div className="space-y-1.5">
          {pendingFiles.map((file, i) =>
            (() => {
              const frameIndex = items.length + i;
              const role = getFrameRole(frameIndex);

              return (
                <div
                  key={`${file.name}-${file.size}-${file.lastModified}-${i}`}
                  className="border-accent/40 bg-accent/5 flex items-center justify-between gap-3 rounded-[1.25rem] border border-dashed px-4 py-2.5"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="border-accent/30 relative h-12 w-12 shrink-0 overflow-hidden rounded-[0.75rem] border bg-panel-dark">
                      <PendingThumbnail file={file} />
                      <span className="absolute bottom-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/70 text-[0.48rem] font-medium text-white">
                        {frameIndex + 1}
                      </span>
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-xs text-muted">
                          {file.name}
                        </span>
                        <span className="shrink-0 text-[0.62rem] uppercase tracking-eyebrow text-accent-text">
                          Queued
                        </span>
                      </div>
                      <p className="text-[0.62rem] uppercase tracking-[0.24em] text-accent-text">
                        {role.label}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onFileRemove(i)}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted transition-colors hover:bg-panel hover:text-error-text"
                    aria-label="Remove queued file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })()
          )}
        </div>
      ) : null}

      {/* URL input */}
      {showAddControls && showUrlInput ? (
        <div className="flex gap-2">
          <input
            autoFocus
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddUrl();
              }
              if (e.key === "Escape") {
                setShowUrlInput(false);
                setUrlDraft("");
              }
            }}
            className="input-field flex-1 text-xs"
            placeholder="https://… or /images/…"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            disabled={!urlDraft.trim()}
            className="control-pill border-foreground bg-foreground text-background disabled:opacity-40"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setShowUrlInput(false);
              setUrlDraft("");
            }}
            className="control-pill"
          >
            Cancel
          </button>
        </div>
      ) : showAddControls ? (
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => setShowUrlInput(true)}
            className="control-pill"
          >
            <Plus className="h-3.5 w-3.5" />
            Add URL
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="control-pill"
          >
            <Plus className="h-3.5 w-3.5" />
            Upload Files
          </button>
        </div>
      ) : null}

      {showAddControls ? (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          aria-label="Upload gallery images"
          onChange={handleFileChange}
          className="sr-only"
        />
      ) : null}
    </div>
  );
}
