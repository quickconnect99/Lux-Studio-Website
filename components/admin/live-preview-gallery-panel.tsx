"use client";

import { ResilientImage as Image } from "@/components/ui/resilient-image";
import { EditablePreviewField } from "@/components/admin/live-preview-field-controls";
import { PreviewFieldShell } from "@/components/admin/field-highlight-shell";
import { getGalleryFrameRole } from "@/lib/admin-project-fields";
import type { AdminProjectFieldKey } from "@/lib/admin-types";

type Props = {
  galleryImageList: string[];
  captionRawLines: string[];
  altRawLines: string[];
  activeField: AdminProjectFieldKey | null;
  onActiveFieldChange: (field: AdminProjectFieldKey | null) => void;
  onUpdateCaption: (index: number, value: string) => void;
  onUpdateAlt: (index: number, value: string) => void;
  onReplaceGalleryImage: (index: number, value: string) => void;
  onNavigateToImageField: (
    field: "coverImage" | "gallery",
    galleryIndex?: number
  ) => void;
};

/**
 * Per-frame gallery controls: image path, caption, and the alt text field
 * that is edited and stored independently of the caption.
 */
export function LivePreviewGalleryPanel({
  galleryImageList,
  captionRawLines,
  altRawLines,
  activeField,
  onActiveFieldChange,
  onUpdateCaption,
  onUpdateAlt,
  onReplaceGalleryImage,
  onNavigateToImageField
}: Props) {
  return (
    <PreviewFieldShell
      fieldKey="gallery"
      activeField={activeField}
      onActiveFieldChange={onActiveFieldChange}
      className="panel-2xl p-4"
    >
      <p className="mb-3 text-[0.6rem] uppercase tracking-eyebrow text-muted">
        Gallery ({galleryImageList.length}{" "}
        {galleryImageList.length === 1 ? "frame" : "frames"})
      </p>
      <p className="mb-4 text-[0.72rem] leading-5 text-muted">
        Live page order: frame 01 becomes the large project image below the
        narrative. Frame 02+ appear lower on the page as supporting stills.
      </p>
      <div className="space-y-4">
        {galleryImageList.map((src, index) => {
          const role = getGalleryFrameRole(index);

          return (
            <div
              key={`${src}-${index}`}
              className="rounded-[1.25rem] border border-line bg-panel-secondary p-3"
            >
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => onNavigateToImageField("gallery", index)}
                  className="relative h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-line bg-panel-dark"
                  title={`Open the path for frame ${index + 1}`}
                  aria-label={`Open image path for frame ${index + 1}`}
                >
                  <Image
                    src={src}
                    alt={`Frame ${index + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </button>

                <div className="min-w-0 flex-1 space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[0.58rem] uppercase tracking-[0.28em] text-muted">
                        Frame {String(index + 1).padStart(2, "0")}
                      </p>
                      <span className="border-accent/30 bg-accent/10 rounded-full border px-2 py-1 text-[0.55rem] uppercase tracking-[0.24em] text-accent-text">
                        {role.label}
                      </span>
                    </div>
                    <p className="text-[0.7rem] leading-5 text-muted">
                      {role.description}
                    </p>
                  </div>

                  <div>
                    <p className="text-[0.58rem] uppercase tracking-[0.28em] text-muted">
                      Image URL
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
                      Caption
                    </p>
                    <EditablePreviewField
                      fieldKey="galleryCaption"
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

                  <div>
                    <p className="text-[0.58rem] uppercase tracking-[0.28em] text-muted">
                      Alt text
                    </p>
                    <EditablePreviewField
                      fieldKey="galleryAlt"
                      value={altRawLines[index] ?? ""}
                      placeholder="Describe this image independently of its caption."
                      onCommit={(_, value) => onUpdateAlt(index, value)}
                      wrapperClassName="-mx-2 mt-1 px-2 py-1"
                      displayClassName="block break-words text-xs leading-6 text-muted"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </PreviewFieldShell>
  );
}
