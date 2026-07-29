import type { AdminSaveReport } from "@/lib/admin-types";
import { formatFileSize } from "@/lib/admin-utils";

type MediaFiles = {
  coverFile: File | null;
  galleryFiles: File[];
  videoFile: File | null;
};

type AdminSaveFollowUpState = {
  cleanupCompleted: boolean;
  publicRefreshCompleted: boolean;
};

/**
 * Adds non-fatal cleanup and cache-refresh warnings to an otherwise successful
 * save report.
 */
export function withAdminSaveWarnings(
  report: AdminSaveReport,
  { cleanupCompleted, publicRefreshCompleted }: AdminSaveFollowUpState
): AdminSaveReport {
  return {
    ...report,
    items: [
      ...report.items,
      ...(!cleanupCompleted
        ? [
            {
              id: "media-cleanup",
              label: "Unused media cleanup will be retried later",
              tone: "warning" as const
            }
          ]
        : []),
      ...(!publicRefreshCompleted
        ? [
            {
              id: "public-refresh",
              label: "Public pages may take up to five minutes to refresh",
              tone: "warning" as const
            }
          ]
        : [])
    ]
  };
}

/** Describes which project data and queued media were persisted to Supabase. */
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

/**
 * Describes a demo/session save and explicitly identifies files that still
 * require a signed-in Supabase upload.
 */
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

/** Builds the detailed result shown after a successful Site Settings save. */
export function buildSiteSettingsSaveReport({
  heroVideoFile,
  selectedFrameFiles,
  aboutTeamGalleryFiles,
  aboutTeamMemberImageFiles,
  cleanupCompleted,
  publicRefreshCompleted
}: {
  heroVideoFile: File | null;
  selectedFrameFiles: File[];
  aboutTeamGalleryFiles: File[];
  aboutTeamMemberImageFiles: File[];
} & AdminSaveFollowUpState): AdminSaveReport {
  return withAdminSaveWarnings(
    {
      title: "Site settings saved",
      items: [
        {
          id: "site-settings",
          label: "Global site settings saved",
          detail: "Supabase",
          tone: "success"
        },
        ...(heroVideoFile
          ? [
              {
                id: "hero-video",
                label: "Hero reel uploaded",
                detail: heroVideoFile.name,
                tone: "success" as const
              }
            ]
          : []),
        ...(selectedFrameFiles.length > 0
          ? [
              {
                id: "selected-frames",
                label: `${selectedFrameFiles.length} selected frame${
                  selectedFrameFiles.length === 1 ? "" : "s"
                } uploaded`,
                detail: "Selected frames",
                tone: "success" as const
              }
            ]
          : []),
        ...(aboutTeamMemberImageFiles.length > 0
          ? [
              {
                id: "about-team-member-images",
                label: `${aboutTeamMemberImageFiles.length} team portrait${
                  aboutTeamMemberImageFiles.length === 1 ? "" : "s"
                } uploaded`,
                detail: "About team",
                tone: "success" as const
              }
            ]
          : []),
        ...(aboutTeamGalleryFiles.length > 0
          ? [
              {
                id: "about-team-gallery",
                label: `${aboutTeamGalleryFiles.length} team gallery image${
                  aboutTeamGalleryFiles.length === 1 ? "" : "s"
                } uploaded`,
                detail: "About team gallery",
                tone: "success" as const
              }
            ]
          : [])
      ]
    },
    { cleanupCompleted, publicRefreshCompleted }
  );
}
