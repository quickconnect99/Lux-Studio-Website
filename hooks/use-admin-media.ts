"use client";

import { type ChangeEvent, useCallback, useEffect, useState } from "react";
import { getInvalidMediaFiles } from "@/lib/admin-persistence";

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
  const [siteHeroVideoFile, setSiteHeroVideoFileState] = useState<File | null>(
    null
  );
  const [selectedFrameFiles, setSelectedFrameFiles] = useState<File[]>([]);
  const [aboutTeamGalleryFiles, setAboutTeamGalleryFiles] = useState<File[]>(
    []
  );
  const [aboutTeamMemberImageFiles, setAboutTeamMemberImageFiles] = useState<
    Array<{ index: number; file: File }>
  >([]);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

  const validateFiles = useCallback(
    (files: File[], kind: "image" | "video") => {
      const invalid = getInvalidMediaFiles(files, kind);

      if (invalid.length === 0) {
        return true;
      }

      const maxLabel = kind === "image" ? "15 MB" : "500 MB";
      const formats =
        kind === "image"
          ? "AVIF, GIF, JPEG, PNG, or WebP"
          : "MOV, MP4, or WebM";
      onError(
        `Unsupported media: ${invalid.map((file) => file.name).join(", ")}. Use ${formats}, with a maximum of ${maxLabel} per file.`
      );
      return false;
    },
    [onError]
  );

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
    setAboutTeamGalleryFiles([]);
    setAboutTeamMemberImageFiles([]);
  }, []);

  const clearSiteSettingsMedia = useCallback(() => {
    setSiteHeroVideoFileState(null);
    setSelectedFrameFiles([]);
    setAboutTeamGalleryFiles([]);
    setAboutTeamMemberImageFiles([]);
  }, []);

  const addGalleryFiles = useCallback(
    (newFiles: File[]) => {
      if (!validateFiles(newFiles, "image")) {
        return;
      }

      onChange();
      setGalleryFiles((current) => [...current, ...newFiles]);
    },
    [onChange, validateFiles]
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
      if (!validateFiles(newFiles, "image")) {
        return;
      }

      onChange();
      setSelectedFrameFiles((current) => [...current, ...newFiles]);
    },
    [onChange, validateFiles]
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

  const addAboutTeamGalleryFiles = useCallback(
    (newFiles: File[]) => {
      if (!validateFiles(newFiles, "image")) {
        return;
      }

      onChange();
      setAboutTeamGalleryFiles((current) => [...current, ...newFiles]);
    },
    [onChange, validateFiles]
  );

  const removeAboutTeamGalleryFile = useCallback(
    (index: number) => {
      onChange();
      setAboutTeamGalleryFiles((current) =>
        current.filter((_, fileIndex) => fileIndex !== index)
      );
    },
    [onChange]
  );

  const setAboutTeamMemberImageFile = useCallback(
    (index: number, file: File | null) => {
      if (file && !validateFiles([file], "image")) {
        return;
      }

      onChange();
      setAboutTeamMemberImageFiles((current) => {
        const withoutIndex = current.filter((item) => item.index !== index);
        return file ? [...withoutIndex, { index, file }] : withoutIndex;
      });
    },
    [onChange, validateFiles]
  );

  const handleFileSelection = useCallback(
    (
      event: ChangeEvent<HTMLInputElement>,
      type: "cover" | "video" | "siteHeroVideo"
    ) => {
      const files = Array.from(event.target.files ?? []);
      const isVideo = type === "video" || type === "siteHeroVideo";

      if (!validateFiles(files, isVideo ? "video" : "image")) {
        event.target.value = "";
        return;
      }

      if (type === "cover") setCoverFile(files[0] ?? null);
      if (type === "video") setVideoFile(files[0] ?? null);
      if (type === "siteHeroVideo") setSiteHeroVideoFile(files[0] ?? null);
    },
    [setCoverFile, setSiteHeroVideoFile, setVideoFile, validateFiles]
  );

  return {
    coverFile,
    galleryFiles,
    videoFile,
    siteHeroVideoFile,
    selectedFrameFiles,
    aboutTeamGalleryFiles,
    aboutTeamMemberImageFiles,
    coverPreviewUrl,
    setCoverFile,
    setVideoFile,
    setSiteHeroVideoFile,
    addGalleryFiles,
    removeGalleryFile,
    addSelectedFrameFiles,
    removeSelectedFrameFile,
    addAboutTeamGalleryFiles,
    removeAboutTeamGalleryFile,
    setAboutTeamMemberImageFile,
    handleFileSelection,
    clearMedia,
    clearSiteSettingsMedia
  };
}
