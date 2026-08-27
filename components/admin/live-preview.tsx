"use client";

import type {
  PreviewEditableField,
  PreviewToggleField
} from "@/components/admin/live-preview-field-controls";
import { LivePreviewHeroPanel } from "@/components/admin/live-preview-hero-panel";
import { LivePreviewMetaPanel } from "@/components/admin/live-preview-meta-panel";
import { LivePreviewGalleryPanel } from "@/components/admin/live-preview-gallery-panel";
import type { AdminProjectFieldKey, ProjectFormState } from "@/lib/admin-types";

export type { PreviewEditableField, PreviewToggleField };

type LivePreviewProps = {
  formState: ProjectFormState;
  coverPreviewSrc: string;
  isDirty: boolean;
  galleryImageList: string[];
  captionRawLines: string[];
  altRawLines: string[];
  activeField: AdminProjectFieldKey | null;
  onActiveFieldChange: (field: AdminProjectFieldKey | null) => void;
  onUpdateField: (field: PreviewEditableField, value: string) => void;
  onUpdateCaption: (index: number, value: string) => void;
  onUpdateAlt: (index: number, value: string) => void;
  onReplaceGalleryImage: (index: number, value: string) => void;
  onToggleField: (field: PreviewToggleField) => void;
  onNavigateToImageField: (
    field: "coverImage" | "gallery",
    galleryIndex?: number
  ) => void;
  liveProjectHref: string | null;
};

/**
 * Interactive approximation of the public project page used while editing.
 *
 * Text edits are committed through callbacks and image clicks navigate back to
 * the matching editor control. The preview never mutates Supabase directly and
 * may receive deferred form state so rapid typing does not block the editor.
 * The actual fields live in fachliche panels (Hero, Meta, Gallery); this file
 * only assembles them in the public page's visual order.
 */
export function LivePreview({
  formState,
  coverPreviewSrc,
  isDirty,
  galleryImageList,
  captionRawLines,
  altRawLines,
  activeField,
  onActiveFieldChange,
  onUpdateField,
  onUpdateCaption,
  onUpdateAlt,
  onReplaceGalleryImage,
  onToggleField,
  onNavigateToImageField,
  liveProjectHref
}: LivePreviewProps) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
      <LivePreviewHeroPanel
        formState={formState}
        coverPreviewSrc={coverPreviewSrc}
        isDirty={isDirty}
        activeField={activeField}
        onActiveFieldChange={onActiveFieldChange}
        onUpdateField={onUpdateField}
        onToggleField={onToggleField}
        onNavigateToImageField={onNavigateToImageField}
        liveProjectHref={liveProjectHref}
      />

      <LivePreviewMetaPanel
        formState={formState}
        activeField={activeField}
        onActiveFieldChange={onActiveFieldChange}
        onUpdateField={onUpdateField}
      />

      {galleryImageList.length > 0 ? (
        <LivePreviewGalleryPanel
          galleryImageList={galleryImageList}
          captionRawLines={captionRawLines}
          altRawLines={altRawLines}
          activeField={activeField}
          onActiveFieldChange={onActiveFieldChange}
          onUpdateCaption={onUpdateCaption}
          onUpdateAlt={onUpdateAlt}
          onReplaceGalleryImage={onReplaceGalleryImage}
          onNavigateToImageField={onNavigateToImageField}
        />
      ) : null}
    </aside>
  );
}
