"use client";

import { useDeferredValue, useState } from "react";
import type {
  PreviewEditableField,
  PreviewToggleField
} from "@/components/admin/live-preview";
import type { AdminProjectFieldKey, ProjectFormState } from "@/lib/admin-types";
import { slugify } from "@/lib/admin-utils";

type UseAdminWorkspaceViewOptions = {
  formState: ProjectFormState;
  galleryImageList: string[];
  captionRawLines: string[];
  altRawLines: string[];
  coverPreviewImage: string;
  updateField<K extends keyof ProjectFormState>(
    key: K,
    value: ProjectFormState[K]
  ): void;
  setCoverFile(file: File | null): void;
  setVideoFile(file: File | null): void;
};

/**
 * Owns dashboard-local view state — which field is highlighted, and whether
 * the project sidebar and mobile edit/preview pane are visible — and
 * translates Live Preview's generic field-editing callbacks into the
 * specific `useAdminData` field updates they represent.
 *
 * Preview-facing state is wrapped in `useDeferredValue` so fast typing in the
 * editor is never blocked by Live Preview's re-render.
 */
export function useAdminWorkspaceView({
  formState,
  galleryImageList,
  captionRawLines,
  altRawLines,
  coverPreviewImage,
  updateField,
  setCoverFile,
  setVideoFile
}: UseAdminWorkspaceViewOptions) {
  const [activeField, setActiveField] = useState<AdminProjectFieldKey | null>(
    null
  );
  const [isProjectSidebarVisible, setIsProjectSidebarVisible] = useState(true);
  const [workspaceView, setWorkspaceView] = useState<
    "projects" | "edit" | "preview"
  >("edit");

  const deferredPreviewFormState = useDeferredValue(formState);
  const deferredPreviewGallery = useDeferredValue(galleryImageList);
  const deferredPreviewCaptions = useDeferredValue(captionRawLines);
  const deferredPreviewAlts = useDeferredValue(altRawLines);
  const deferredCoverPreview = useDeferredValue(coverPreviewImage);

  function handlePreviewFieldUpdate(
    field: PreviewEditableField,
    value: string
  ) {
    switch (field) {
      case "business":
        updateField("business", value as typeof formState.business);
        break;
      case "title":
        updateField("title", value);
        updateField("slug", slugify(value));
        break;
      case "category":
        updateField("category", value);
        break;
      case "slug":
        updateField("slug", slugify(value));
        break;
      case "shortDescription":
        updateField("shortDescription", value);
        break;
      case "fullDescription":
        updateField("fullDescription", value);
        break;
      case "carModel":
        updateField("carModel", value);
        break;
      case "location":
        updateField("location", value);
        break;
      case "year":
        updateField("year", value);
        break;
      case "behindTheScenes":
        updateField("behindTheScenes", value);
        break;
      case "coverImage":
        setCoverFile(null);
        updateField("coverImage", value);
        break;
      case "videoUrl":
        updateField("videoUrl", value);
        if (value) {
          updateField("uploadedVideo", "");
          setVideoFile(null);
        }
        break;
      case "uploadedVideo":
        updateField("uploadedVideo", value);
        if (value) updateField("videoUrl", "");
        break;
      case "createdAt":
        updateField("createdAt", value);
        break;
      default:
        break;
    }
  }

  function handlePreviewToggle(field: PreviewToggleField) {
    updateField(field, !formState[field]);
  }

  function handlePreviewGalleryImageUpdate(index: number, value: string) {
    const lines = formState.galleryImagesText.split("\n");
    while (lines.length <= index) lines.push("");
    lines[index] = value;
    updateField("galleryImagesText", lines.join("\n"));
  }

  function handlePreviewImageNavigate(
    field: "coverImage" | "gallery",
    galleryIndex?: number
  ) {
    setWorkspaceView("edit");
    setActiveField(field);

    requestAnimationFrame(() => {
      const fieldElement = document.querySelector<HTMLElement>(
        `[data-admin-editor-field="${field}"]`
      );
      const target =
        field === "gallery" && galleryIndex !== undefined
          ? fieldElement?.querySelector<HTMLElement>(
              `[data-gallery-image-index="${galleryIndex}"]`
            )
          : fieldElement?.querySelector<HTMLElement>(
              'input:not([type="file"]), textarea, select'
            );

      (target ?? fieldElement)?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

      window.setTimeout(() => target?.focus({ preventScroll: true }), 450);
    });
  }

  return {
    activeField,
    setActiveField,
    isProjectSidebarVisible,
    setIsProjectSidebarVisible,
    workspaceView,
    setWorkspaceView,
    deferredPreviewFormState,
    deferredPreviewGallery,
    deferredPreviewCaptions,
    deferredPreviewAlts,
    deferredCoverPreview,
    handlePreviewFieldUpdate,
    handlePreviewToggle,
    handlePreviewGalleryImageUpdate,
    handlePreviewImageNavigate
  };
}
