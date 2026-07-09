"use client";

import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useState
} from "react";
import {
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  getOversizedFiles
} from "@/lib/admin-persistence";

export function useAdminMedia({
  onChange,
  onError
}: {
  onChange(): void;
  onError(message: string): void;
}) {
  const [coverFile, setCoverFileState] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [videoFile, setVideoFileState] = useState<File | null>(null);
  const [siteHeroVideoFile, setSiteHeroVideoFileState] =
    useState<File | null>(null);
  const [selectedFrameFiles, setSelectedFrameFiles] = useState<File[]>([]);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!coverFile) {
      setCoverPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(coverFile);
    setCoverPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [coverFile]);

  const setCoverFile = useCallback(
    (file: File | null) => {
      onChange();
      setCoverFileState(file);
    },
    [onChange]
  );

  const setVideoFile = useCallback(
    (file: File | null) => {
      onChange();
      setVideoFileState(file);
    },
    [onChange]
  );

  const setSiteHeroVideoFile = useCallback(
    (file: File | null) => {
      onChange();
      setSiteHeroVideoFileState(file);
    },
    [onChange]
  );

  const clearMedia = useCallback(() => {
    setCoverFileState(null);
    setGalleryFiles([]);
    setVideoFileState(null);
    setSiteHeroVideoFileState(null);
    setSelectedFrameFiles([]);
  }, []);

  const clearSiteSettingsMedia = useCallback(() => {
    setSiteHeroVideoFileState(null);
    setSelectedFrameFiles([]);
  }, []);

  const addGalleryFiles = useCallback(
    (newFiles: File[]) => {
      const oversized = getOversizedFiles(newFiles, MAX_IMAGE_BYTES);

      if (oversized.length > 0) {
        onError(
          `Files too large: ${oversized.map((file) => file.name).join(", ")}. Maximum 25 MB per image.`
        );
        return;
      }

      onChange();
      setGalleryFiles((current) => [...current, ...newFiles]);
    },
    [onChange, onError]
  );

  const removeGalleryFile = useCallback(
    (index: number) => {
      onChange();
      setGalleryFiles((current) =>
        current.filter((_, fileIndex) => fileIndex !== index)
      );
    },
    [onChange]
  );

  const addSelectedFrameFiles = useCallback(
    (newFiles: File[]) => {
      const oversized = getOversizedFiles(newFiles, MAX_IMAGE_BYTES);

      if (oversized.length > 0) {
        onError(
          `Files too large: ${oversized.map((file) => file.name).join(", ")}. Maximum 25 MB per image.`
        );
        return;
      }

      onChange();
      setSelectedFrameFiles((current) => [...current, ...newFiles]);
    },
    [onChange, onError]
  );

  const removeSelectedFrameFile = useCallback(
    (index: number) => {
      onChange();
      setSelectedFrameFiles((current) =>
        current.filter((_, fileIndex) => fileIndex !== index)
      );
    },
    [onChange]
  );

  const handleFileSelection = useCallback(
    (
      event: ChangeEvent<HTMLInputElement>,
      type: "cover" | "video" | "siteHeroVideo"
    ) => {
      const files = Array.from(event.target.files ?? []);
      const isVideo = type === "video" || type === "siteHeroVideo";
      const limit = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
      const limitLabel = isVideo ? "2 GB" : "25 MB";
      const oversized = getOversizedFiles(files, limit);

      if (oversized.length > 0) {
        onError(
          `File too large: ${oversized.map((file) => file.name).join(", ")}. Maximum size for ${isVideo ? "videos" : "images"} is ${limitLabel}.`
        );
        event.target.value = "";
        return;
      }

      if (type === "cover") setCoverFile(files[0] ?? null);
      if (type === "video") setVideoFile(files[0] ?? null);
      if (type === "siteHeroVideo") setSiteHeroVideoFile(files[0] ?? null);
    },
    [onError, setCoverFile, setSiteHeroVideoFile, setVideoFile]
  );

  return {
    coverFile,
    galleryFiles,
    videoFile,
    siteHeroVideoFile,
    selectedFrameFiles,
    coverPreviewUrl,
    setCoverFile,
    setVideoFile,
    setSiteHeroVideoFile,
    addGalleryFiles,
    removeGalleryFile,
    addSelectedFrameFiles,
    removeSelectedFrameFile,
    handleFileSelection,
    clearMedia,
    clearSiteSettingsMedia
  };
}
