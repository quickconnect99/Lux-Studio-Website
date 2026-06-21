import type { AdminSaveReport } from "@/lib/admin-types";
import { formatFileSize } from "@/lib/admin-utils";

type MediaFiles = {
  coverFile: File | null;
  galleryFiles: File[];
  videoFile: File | null;
};

export function buildRemoteProjectSaveReport({
  isTemplateSource,
  coverFile,
  galleryFiles,
  videoFile
}: MediaFiles & { isTemplateSource: boolean }): AdminSaveReport {
  return {
    title: isTemplateSource
      ? "New project created and synced"
      : "Project saved to Supabase",
    items: [
      {
        id: "project",
        label: "Project data saved",
        detail: "Supabase",
        tone: "success"
      },
      ...(coverFile
        ? [
            {
              id: "cover",
              label: "Cover uploaded",
              detail: formatFileSize(coverFile.size),
              tone: "success" as const
            }
          ]
        : []),
      ...(galleryFiles.length > 0
        ? [
            {
              id: "gallery",
              label: `${galleryFiles.length} gallery ${galleryFiles.length === 1 ? "image" : "images"} uploaded`,
              detail: formatFileSize(
                galleryFiles.reduce((sum, file) => sum + file.size, 0)
              ),
              tone: "success" as const
            }
          ]
        : []),
      ...(videoFile
        ? [
            {
              id: "video",
              label: "Video uploaded",
              detail: formatFileSize(videoFile.size),
              tone: "success" as const
            }
          ]
        : []),
      ...(!coverFile && galleryFiles.length === 0 && !videoFile
        ? [
            {
              id: "metadata-only",
              label: "No media uploads in this save",
              detail: "Metadata only",
              tone: "info" as const
            }
          ]
        : [])
    ]
  };
}

export function buildLocalProjectSaveReport({
  isSupabaseConfigured,
  coverFile,
  galleryFiles,
  videoFile
}: MediaFiles & { isSupabaseConfigured: boolean }): AdminSaveReport {
  return {
    title: isSupabaseConfigured ? "Saved locally only" : "Local draft saved",
    items: [
      {
        id: "project",
        label: isSupabaseConfigured
          ? "Project data saved in this browser session"
          : "Project data saved in browser storage",
        detail: isSupabaseConfigured ? "Session only" : "localStorage",
        tone: "info"
      },
      ...(coverFile
        ? [
            {
              id: "cover-warning",
              label: "Cover upload still pending",
              detail: "Sign in to Supabase to persist this file",
              tone: "warning" as const
            }
          ]
        : []),
      ...(galleryFiles.length > 0
        ? [
            {
              id: "gallery-warning",
              label: `${galleryFiles.length} gallery ${galleryFiles.length === 1 ? "image is" : "images are"} still pending`,
              detail: "Sign in to Supabase to upload queued media",
              tone: "warning" as const
            }
          ]
        : []),
      ...(videoFile
        ? [
            {
              id: "video-warning",
              label: "Video upload still pending",
              detail: "Sign in to Supabase to persist this file",
              tone: "warning" as const
            }
          ]
        : [])
    ]
  };
}
