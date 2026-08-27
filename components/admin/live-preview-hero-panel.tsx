"use client";

import { ResilientImage as Image } from "@/components/ui/resilient-image";
import { ExternalLink, PenSquare } from "lucide-react";
import {
  EditablePreviewField,
  PreviewToggleChip,
  type PreviewEditableField,
  type PreviewToggleField
} from "@/components/admin/live-preview-field-controls";
import { PreviewFieldShell } from "@/components/admin/field-highlight-shell";
import type { AdminProjectFieldKey, ProjectFormState } from "@/lib/admin-types";
import { getProjectPrimaryMetaLabel } from "@/lib/project-business";

type Props = {
  formState: ProjectFormState;
  coverPreviewSrc: string;
  isDirty: boolean;
  activeField: AdminProjectFieldKey | null;
  onActiveFieldChange: (field: AdminProjectFieldKey | null) => void;
  onUpdateField: (field: PreviewEditableField, value: string) => void;
  onToggleField: (field: PreviewToggleField) => void;
  onNavigateToImageField: (
    field: "coverImage" | "gallery",
    galleryIndex?: number
  ) => void;
  liveProjectHref: string | null;
};

/**
 * The interactive project card: cover image, publish/featured toggles, and
 * every headline/summary field that appears above the fold on the public
 * project page.
 */
export function LivePreviewHeroPanel({
  formState,
  coverPreviewSrc,
  isDirty,
  activeField,
  onActiveFieldChange,
  onUpdateField,
  onToggleField,
  onNavigateToImageField,
  liveProjectHref
}: Props) {
  const primaryMetaLabel = getProjectPrimaryMetaLabel(formState.business);

  return (
    <div className="panel-2xl overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-eyebrow text-muted">
            Quick Preview
          </p>
          <p className="mt-1 text-xs leading-6 text-muted">
            Click text to edit it. Click an image to open its field in the
            editor.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {liveProjectHref ? (
            <a
              href={liveProjectHref}
              target="_blank"
              rel="noreferrer"
              className="control-pill text-accent-text"
            >
              Open Live Page
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-panel-secondary text-muted">
            <PenSquare className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="relative min-h-[240px] bg-panel-dark">
        <PreviewFieldShell
          fieldKey="coverImage"
          activeField={activeField}
          onActiveFieldChange={onActiveFieldChange}
          className="absolute inset-0 overflow-hidden rounded-none"
        >
          <button
            type="button"
            onClick={() => onNavigateToImageField("coverImage")}
            className="absolute inset-0 block w-full cursor-pointer"
            title="Open the cover image field"
            aria-label="Open cover image field"
          >
            {coverPreviewSrc ? (
              <Image
                src={coverPreviewSrc}
                alt={formState.title || "Project preview"}
                fill
                sizes="360px"
                unoptimized
                className="object-cover"
              />
            ) : null}
          </button>
        </PreviewFieldShell>
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-1.5 p-3">
          <PreviewToggleChip
            active={formState.published}
            label={formState.published ? "Published" : "Draft"}
            onClick={() => onToggleField("published")}
            activeClassName="bg-success/20 text-success"
            inactiveClassName="bg-foreground/50 text-background/70"
            highlighted={activeField === "published"}
            onHoverChange={(isActive) =>
              onActiveFieldChange(isActive ? "published" : null)
            }
          />
          <PreviewToggleChip
            active={formState.featured}
            label="Featured"
            onClick={() => onToggleField("featured")}
            activeClassName="bg-accent/20 text-accent"
            inactiveClassName="bg-black/35 text-white/75"
            highlighted={activeField === "featured"}
            onHoverChange={(isActive) =>
              onActiveFieldChange(isActive ? "featured" : null)
            }
          />
          {isDirty ? (
            <span className="bg-warning/20 rounded-full px-2.5 py-1 text-[0.6rem] uppercase tracking-eyebrow text-warning backdrop-blur-sm">
              Unsaved
            </span>
          ) : null}
        </div>
      </div>

      <div className="space-y-5 p-5">
        <PreviewFieldShell
          fieldKey="business"
          activeField={activeField}
          onActiveFieldChange={onActiveFieldChange}
        >
          <EditablePreviewField
            fieldKey="business"
            value={formState.business}
            placeholder="Project business"
            onCommit={onUpdateField}
            wrapperClassName="-mx-2 -my-1 px-2 py-1"
            displayClassName="text-[0.62rem] uppercase tracking-[0.28em] text-accent-text"
          />
        </PreviewFieldShell>

        <PreviewFieldShell
          fieldKey="category"
          activeField={activeField}
          onActiveFieldChange={onActiveFieldChange}
        >
          <EditablePreviewField
            fieldKey="category"
            value={formState.category}
            placeholder="Project category"
            onCommit={onUpdateField}
            wrapperClassName="-mx-2 -my-1 px-2 py-1"
            displayClassName="text-[0.62rem] uppercase tracking-[0.28em] text-muted"
          />
        </PreviewFieldShell>

        <PreviewFieldShell
          fieldKey="title"
          activeField={activeField}
          onActiveFieldChange={onActiveFieldChange}
        >
          <EditablePreviewField
            fieldKey="title"
            value={formState.title}
            placeholder="Project title"
            onCommit={onUpdateField}
            wrapperClassName="-mx-2 -my-2 px-2 py-2"
            displayClassName="font-[family-name:var(--font-display)] text-3xl uppercase leading-[0.9] text-foreground"
            inputClassName="font-[family-name:var(--font-display)] text-2xl uppercase tracking-tight"
          />
        </PreviewFieldShell>

        <PreviewFieldShell
          fieldKey="shortDescription"
          activeField={activeField}
          onActiveFieldChange={onActiveFieldChange}
        >
          <EditablePreviewField
            fieldKey="shortDescription"
            value={formState.shortDescription}
            placeholder="Short description will appear here."
            kind="textarea"
            rows={4}
            onCommit={onUpdateField}
            wrapperClassName="-mx-2 -my-1 px-2 py-2"
            displayClassName="text-base leading-7 text-muted"
            inputClassName="min-h-[7.5rem]"
          />
        </PreviewFieldShell>

        <PreviewFieldShell
          fieldKey="slug"
          activeField={activeField}
          onActiveFieldChange={onActiveFieldChange}
        >
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
        </PreviewFieldShell>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <PreviewFieldShell
            fieldKey="carModel"
            activeField={activeField}
            onActiveFieldChange={onActiveFieldChange}
            className="metadata-card"
          >
            <p className="metadata-label">{primaryMetaLabel}</p>
            <EditablePreviewField
              fieldKey="carModel"
              value={formState.carModel}
              placeholder="TBD"
              onCommit={onUpdateField}
              wrapperClassName="-mx-2 mt-1 px-2 py-1"
              displayClassName="block text-xs uppercase tracking-wide text-foreground"
            />
          </PreviewFieldShell>
          <PreviewFieldShell
            fieldKey="category"
            activeField={activeField}
            onActiveFieldChange={onActiveFieldChange}
            className="metadata-card"
          >
            <p className="metadata-label">Category</p>
            <EditablePreviewField
              fieldKey="category"
              value={formState.category}
              placeholder="TBD"
              onCommit={onUpdateField}
              wrapperClassName="-mx-2 mt-1 px-2 py-1"
              displayClassName="block text-xs uppercase tracking-wide text-foreground"
            />
          </PreviewFieldShell>
          <PreviewFieldShell
            fieldKey="location"
            activeField={activeField}
            onActiveFieldChange={onActiveFieldChange}
            className="metadata-card"
          >
            <p className="metadata-label">Location</p>
            <EditablePreviewField
              fieldKey="location"
              value={formState.location}
              placeholder="TBD"
              onCommit={onUpdateField}
              wrapperClassName="-mx-2 mt-1 px-2 py-1"
              displayClassName="block text-xs uppercase tracking-wide text-foreground"
            />
          </PreviewFieldShell>
          <PreviewFieldShell
            fieldKey="year"
            activeField={activeField}
            onActiveFieldChange={onActiveFieldChange}
            className="metadata-card"
          >
            <p className="metadata-label">Year</p>
            <EditablePreviewField
              fieldKey="year"
              value={formState.year}
              placeholder="TBD"
              onCommit={onUpdateField}
              wrapperClassName="-mx-2 mt-1 px-2 py-1"
              displayClassName="block text-xs uppercase tracking-wide text-foreground"
            />
          </PreviewFieldShell>
        </div>

        <PreviewFieldShell
          fieldKey="fullDescription"
          activeField={activeField}
          onActiveFieldChange={onActiveFieldChange}
          className="border-t border-line pt-4"
        >
          <p className="text-xs uppercase tracking-eyebrow text-muted">
            Project Description
          </p>
          <EditablePreviewField
            fieldKey="fullDescription"
            value={formState.fullDescription}
            placeholder="Full project narrative."
            kind="textarea"
            rows={6}
            onCommit={onUpdateField}
            wrapperClassName="-mx-2 mt-3 px-2 py-2"
            displayClassName="text-base leading-7 text-muted"
            inputClassName="min-h-[10rem]"
          />
        </PreviewFieldShell>
      </div>
    </div>
  );
}
