"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { GripVertical, Plus, X } from "lucide-react";
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
};

// ── Sortable row ─────────────────────────────────────────────────────────────

type SortableItemProps = {
  item: GalleryItem;
  displayIndex: number;
  onRemove: () => void;
  onCaptionChange: (value: string) => void;
};

function SortableItem({
  item,
  displayIndex,
  onRemove,
  onCaptionChange
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition
      }}
      className={cn(
        "grid grid-cols-[28px_68px_1fr_32px] items-start gap-3 rounded-[1.25rem] border border-line bg-panel-secondary p-3",
        isDragging && "z-50 opacity-75 shadow-lg"
      )}
    >
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="mt-1.5 flex h-6 w-6 cursor-grab items-center justify-center rounded-md text-muted hover:text-foreground active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Thumbnail */}
      <div className="relative h-16 w-16 overflow-hidden rounded-[0.875rem] border border-line bg-panel-dark">
        <Image
          src={item.image}
          alt={`Frame ${displayIndex + 1}`}
          fill
          sizes="64px"
          className="object-cover"
        />
        <span className="absolute bottom-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/70 text-[0.48rem] font-medium text-white">
          {displayIndex + 1}
        </span>
      </div>

      {/* Caption */}
      <textarea
        value={item.caption}
        onChange={(e) => onCaptionChange(e.target.value)}
        className="textarea-field min-h-[4rem] text-xs"
        placeholder={`Caption for frame ${displayIndex + 1}…`}
      />

      {/* Remove */}
      <button
        type="button"
        onClick={onRemove}
        className="mt-1.5 flex h-6 w-6 items-center justify-center rounded-md text-muted transition-colors hover:text-error"
        aria-label={`Remove frame ${displayIndex + 1}`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

let globalIdCounter = 0;
function nextId() {
  return `gi-${++globalIdCounter}`;
}

function buildItems(images: string[], captions: string[]): GalleryItem[] {
  return images.map((img, i) => ({
    id: nextId(),
    image: img,
    caption: captions[i] ?? ""
  }));
}

export function GalleryEditor({
  images,
  captions,
  pendingFiles,
  onImagesChange,
  onFilesAdd,
  onFileRemove
}: GalleryEditorProps) {
  // ── Local state — initialized from props, owns drag order ───────────────
  // The parent uses `key` to remount this component on project switch/save,
  // so we don't need a useEffect sync here.
  const [items, setItems] = useState<GalleryItem[]>(() =>
    buildItems(images, captions)
  );

  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ids = useMemo(() => items.map((item) => item.id), [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  // ── Emit helper ──────────────────────────────────────────────────────────
  function emit(nextItems: GalleryItem[]) {
    onImagesChange(
      nextItems.map((item) => item.image),
      nextItems.map((item) => item.caption)
    );
  }

  // ── Drag end ─────────────────────────────────────────────────────────────
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex((item) => item.id === active.id);
    const newIdx = items.findIndex((item) => item.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const next = arrayMove(items, oldIdx, newIdx);
    setItems(next);
    emit(next);
  }

  // ── Remove ───────────────────────────────────────────────────────────────
  function handleRemove(id: string) {
    const next = items.filter((item) => item.id !== id);
    setItems(next);
    emit(next);
  }

  // ── Caption ──────────────────────────────────────────────────────────────
  function handleCaptionChange(id: string, caption: string) {
    const next = items.map((item) =>
      item.id === id ? { ...item, caption } : item
    );
    setItems(next);
    emit(next);
  }

  // ── Add URL ──────────────────────────────────────────────────────────────
  function handleAddUrl() {
    const trimmed = urlDraft.trim();
    if (!trimmed) return;
    const next = [...items, { id: nextId(), image: trimmed, caption: "" }];
    setItems(next);
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
      {/* Sortable image list */}
      {items.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((item, displayIndex) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  displayIndex={displayIndex}
                  onRemove={() => handleRemove(item.id)}
                  onCaptionChange={(v) => handleCaptionChange(item.id, v)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : null}

      {/* Pending upload files */}
      {pendingFiles.length > 0 ? (
        <div className="space-y-1.5">
          {pendingFiles.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="flex items-center justify-between gap-3 rounded-[1.25rem] border border-dashed border-accent/40 bg-accent/5 px-4 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent/25 text-[0.48rem] font-medium text-accent">
                  {items.length + i + 1}
                </span>
                <span className="truncate text-xs text-muted">{file.name}</span>
                <span className="shrink-0 text-[0.62rem] uppercase tracking-eyebrow text-accent">
                  Queued
                </span>
              </div>
              <button
                type="button"
                onClick={() => onFileRemove(i)}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:text-error"
                aria-label="Remove queued file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {/* URL input */}
      {showUrlInput ? (
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
      ) : (
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
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="sr-only"
      />
    </div>
  );
}
