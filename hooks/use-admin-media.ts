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

  const clearMedia = useCallback(() => {
    setCoverFileState(null);
    setGalleryFiles([]);
    setVideoFileState(null);
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

  const handleFileSelection = useCallback(
    (event: ChangeEvent<HTMLInputElement>, type: "cover" | "video") => {
      const files = Array.from(event.target.files ?? []);
      const limit = type === "video" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
      const limitLabel = type === "video" ? "2 GB" : "25 MB";
      const oversized = getOversizedFiles(files, limit);

      if (oversized.length > 0) {
        onError(
          `File too large: ${oversized.map((file) => file.name).join(", ")}. Maximum size for ${type === "video" ? "videos" : "images"} is ${limitLabel}.`
        );
        event.target.value = "";
        return;
      }

      if (type === "cover") setCoverFile(files[0] ?? null);
      if (type === "video") setVideoFile(files[0] ?? null);
    },
    [onError, setCoverFile, setVideoFile]
  );

  return {
    coverFile,
    galleryFiles,
    videoFile,
    coverPreviewUrl,
    setCoverFile,
    setVideoFile,
    addGalleryFiles,
    removeGalleryFile,
    handleFileSelection,
    clearMedia
  };
}
