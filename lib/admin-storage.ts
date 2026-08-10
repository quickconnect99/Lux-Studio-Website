import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AdminUploadProgress,
  SiteSettingsFormState
} from "@/lib/admin-types";
import { parseMultilineInput } from "@/lib/admin-utils";
import { buildFrameItems } from "@/lib/project-images";
import { SUPABASE_BUCKET } from "@/lib/supabase";

export type AdminStorageFolder =
  | "about-team"
  | "about-team-gallery"
  | "covers"
  | "gallery"
  | "selected-frames"
  | "videos";

type SiteSettingsMediaFields = Pick<
  SiteSettingsFormState,
  | "heroVideoUrl"
  | "selectedFramesText"
  | "motionFramesText"
  | "aboutTeamGalleryText"
  | "aboutTeamMembers"
>;

const RESUMABLE_UPLOAD_THRESHOLD_BYTES = 6 * 1024 * 1024;

/** Collects every Storage-capable URL represented by Site Settings media. */
export function getAdminSiteSettingsMediaUrls(
  formState: SiteSettingsMediaFields
) {
  const frameImages = [
    formState.selectedFramesText,
    formState.motionFramesText
  ].flatMap((value) =>
    buildFrameItems({
      selectedFrames: parseMultilineInput(value),
      fallbackImages: [],
      galleryImages: []
    }).map((frame) => frame.image)
  );

  return Array.from(
    new Set(
      [
        formState.heroVideoUrl,
        ...frameImages,
        ...parseMultilineInput(formState.aboutTeamGalleryText),
        ...formState.aboutTeamMembers.map((member) => member.image)
      ].filter(Boolean)
    )
  );
}

type ResumableUploadRecord = {
  metadata?: Record<string, string>;
};

/**
 * Returns the object path that an earlier TUS upload actually targets.
 *
 * TUS fingerprints identify the local file and endpoint, not the fresh UUID
 * generated for a later retry. Resuming is therefore safe only when the stored
 * metadata belongs to this bucket and the same logical media folder.
 */
export function getResumableAdminObjectName(
  previousUpload: ResumableUploadRecord,
  requestedFilePath: string
) {
  const objectName = previousUpload.metadata?.objectName?.trim() ?? "";
  const bucketName = previousUpload.metadata?.bucketName?.trim() ?? "";
  const folderSeparator = requestedFilePath.indexOf("/");
  const expectedFolder =
    folderSeparator >= 0 ? requestedFilePath.slice(0, folderSeparator + 1) : "";
  const pathSegments = objectName.split("/");

  if (
    bucketName !== SUPABASE_BUCKET ||
    !expectedFolder ||
    !objectName.startsWith(expectedFolder) ||
    objectName.includes("\\") ||
    pathSegments.some(
      (segment) => !segment || segment === "." || segment === ".."
    )
  ) {
    return null;
  }

  return objectName;
}

function getResumableUploadEndpoint() {
  const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!configuredUrl) return null;

  try {
    const url = new URL(configuredUrl);
    if (url.hostname.endsWith(".supabase.co")) {
      url.hostname = url.hostname.replace(
        /\.supabase\.co$/,
        ".storage.supabase.co"
      );
    }
    url.pathname = "/storage/v1/upload/resumable";
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

async function uploadAdminFileResumably(
  supabase: SupabaseClient,
  file: File,
  filePath: string,
  endpoint: string,
  onProgress?: (uploadedBytes: number, totalBytes: number) => void
) {
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("An authenticated session is required for large uploads.");
  }

  const { Upload } = await import("tus-js-client");

  let uploadedFilePath = filePath;

  await new Promise<void>((resolve, reject) => {
    const upload = new Upload(file, {
      endpoint,
      retryDelays: [0, 3_000, 5_000, 10_000, 20_000],
      headers: {
        authorization: `Bearer ${session.access_token}`
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      chunkSize: RESUMABLE_UPLOAD_THRESHOLD_BYTES,
      metadata: {
        bucketName: SUPABASE_BUCKET,
        objectName: filePath,
        contentType: file.type,
        cacheControl: "31536000"
      },
      onError: reject,
      onProgress,
      onSuccess: () => resolve()
    });

    void upload
      .findPreviousUploads()
      .then((previousUploads) => {
        const previousUpload = previousUploads.find((candidate) =>
          Boolean(getResumableAdminObjectName(candidate, filePath))
        );

        if (previousUpload) {
          uploadedFilePath =
            getResumableAdminObjectName(previousUpload, filePath) ?? filePath;
          upload.resumeFromPreviousUpload(previousUpload);
        }
        upload.start();
      })
      .catch(reject);
  });

  return uploadedFilePath;
}

/**
 * Uploads one validated admin file to a unique path in the configured bucket.
 *
 * Files above 6 MB use Supabase's resumable TUS endpoint when available;
 * smaller files use the regular Storage API. The returned public URL is what
 * project and Site Settings records persist.
 *
 * @throws The Supabase or TUS error when authentication or upload fails.
 */
export async function uploadAdminFile(
  supabase: SupabaseClient,
  file: File,
  folder: AdminStorageFolder,
  onProgress?: (uploadedBytes: number, totalBytes: number) => void
) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const filePath = `${folder}/${crypto.randomUUID()}.${extension}`;
  const resumableEndpoint = getResumableUploadEndpoint();
  let uploadedFilePath = filePath;

  if (file.size > RESUMABLE_UPLOAD_THRESHOLD_BYTES && resumableEndpoint) {
    uploadedFilePath = await uploadAdminFileResumably(
      supabase,
      file,
      filePath,
      resumableEndpoint,
      onProgress
    );
  } else {
    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(filePath, file, {
        upsert: false,
        cacheControl: "31536000",
        contentType: file.type
      });

    if (error) {
      throw error;
    }
  }

  const {
    data: { publicUrl }
  } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(uploadedFilePath);

  return publicUrl;
}

/**
 * Uploads a batch with bounded concurrency while preserving input order.
 *
 * @param onProgress - Called after each completed file with its public URL.
 * @param concurrency - Maximum simultaneous uploads; defaults to three.
 * @returns Public URLs in the same order as `files`.
 * @throws The first upload error after all active workers have settled.
 */
export async function uploadAdminFiles(
  supabase: SupabaseClient,
  files: File[],
  folder: AdminStorageFolder,
  onProgress?: (completed: number, file: File, publicUrl: string) => void,
  concurrency = 3
) {
  const results = new Array<string>(files.length);
  const errors: unknown[] = [];
  let nextIndex = 0;
  let completed = 0;

  async function worker() {
    while (nextIndex < files.length) {
      const index = nextIndex++;
      const file = files[index];

      try {
        const publicUrl = await uploadAdminFile(supabase, file, folder);
        results[index] = publicUrl;
        completed += 1;
        onProgress?.(completed, file, publicUrl);
      } catch (error) {
        errors.push(error);
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, files.length) }, () => worker())
  );

  if (errors.length > 0) {
    throw errors[0];
  }

  return results;
}

/**
 * Creates a save-scoped upload coordinator with one shared progress counter.
 *
 * Every successful URL is reported through `onUploaded`, allowing the caller
 * to remove newly created objects if a later database write fails.
 */
export function createAdminUploadSession({
  supabase,
  totalFiles,
  onProgress,
  onUploaded
}: {
  supabase: SupabaseClient;
  totalFiles: number;
  onProgress: (progress: AdminUploadProgress | null) => void;
  onUploaded: (publicUrl: string) => void;
}) {
  let completedFiles = 0;

  return {
    async uploadFile(file: File, folder: AdminStorageFolder) {
      onProgress({
        current: completedFiles + 1,
        total: totalFiles,
        filename: file.name
      });
      const publicUrl = await uploadAdminFile(supabase, file, folder);
      completedFiles += 1;
      onUploaded(publicUrl);
      return publicUrl;
    },
    async uploadFiles(files: File[], folder: AdminStorageFolder) {
      const progressOffset = completedFiles;
      return uploadAdminFiles(
        supabase,
        files,
        folder,
        (completed, file, publicUrl) => {
          completedFiles = progressOffset + completed;
          onUploaded(publicUrl);
          onProgress({
            current: completedFiles,
            total: totalFiles,
            filename: file.name
          });
        }
      );
    },
    finish() {
      onProgress(null);
    }
  };
}

/**
 * Extracts a bucket-relative object path from a known Supabase public URL.
 *
 * @returns The decoded path or `null` for external and malformed URLs, ensuring
 * cleanup never targets an arbitrary location.
 */
export function getAdminStoragePath(url: string) {
  try {
    const parsed = new URL(url);
    const configuredOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
      : null;

    if (
      (configuredOrigin && parsed.origin !== configuredOrigin) ||
      (!configuredOrigin && !parsed.hostname.endsWith(".supabase.co"))
    ) {
      return null;
    }

    const marker = `/storage/v1/object/public/${SUPABASE_BUCKET}/`;
    const markerIndex = parsed.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    return decodeURIComponent(
      parsed.pathname.slice(markerIndex + marker.length)
    );
  } catch {
    return null;
  }
}

/**
 * Best-effort deletion of known bucket objects.
 *
 * Invalid or external URLs are ignored. A Storage error returns `false`
 * instead of undoing an already completed database mutation.
 */
export async function removeAdminFiles(
  supabase: SupabaseClient,
  urls: string[]
) {
  const paths = Array.from(
    new Set(
      urls
        .map(getAdminStoragePath)
        .filter((path): path is string => Boolean(path))
    )
  );

  if (paths.length === 0) {
    return true;
  }

  const { error } = await supabase.storage.from(SUPABASE_BUCKET).remove(paths);
  return !error;
}

function collectReferencedStrings(value: unknown, references: Set<string>) {
  if (typeof value === "string") {
    const normalizedValue = value.trim();
    references.add(normalizedValue);
    normalizedValue
      .split(/\s*(?:\||->)\s*/)
      .map((part) => part.trim())
      .filter(Boolean)
      .forEach((part) => references.add(part));

    try {
      const structuredValue = JSON.parse(normalizedValue) as unknown;
      if (
        structuredValue &&
        (typeof structuredValue === "object" || Array.isArray(structuredValue))
      ) {
        collectReferencedStrings(structuredValue, references);
      }
    } catch {
      // Plain URLs and legacy delimiter formats are expected here.
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectReferencedStrings(item, references));
    return;
  }

  if (value && typeof value === "object") {
    Object.values(value).forEach((item) =>
      collectReferencedStrings(item, references)
    );
  }
}

async function loadAdminMediaReferences(supabase: SupabaseClient) {
  const [projectsResult, settingsResult] = await Promise.all([
    supabase
      .from("projects")
      .select(
        "cover_image, gallery_images, gallery_items, video_url, uploaded_video"
      ),
    supabase
      .from("site_settings")
      .select(
        "hero_video_url, selected_frames, motion_frames, about_team_images, about_team_members"
      )
  ]);

  if (projectsResult.error || settingsResult.error) {
    return null;
  }

  const references = new Set<string>();
  collectReferencedStrings(projectsResult.data, references);
  collectReferencedStrings(settingsResult.data, references);
  return references;
}

/**
 * Deletes candidate media only after checking every project and Site Settings
 * media field for remaining references.
 *
 * @returns `false` when reference lookup or deletion fails; candidates are
 * retained whenever their safety cannot be established.
 */
export async function removeUnreferencedAdminFiles(
  supabase: SupabaseClient,
  candidateUrls: string[]
) {
  const candidates = Array.from(new Set(candidateUrls.filter(Boolean)));

  if (candidates.length === 0) {
    return true;
  }

  const initialReferences = await loadAdminMediaReferences(supabase);
  if (!initialReferences) {
    return false;
  }

  const initiallyUnreferenced = candidates.filter(
    (url) => !initialReferences.has(url)
  );
  if (initiallyUnreferenced.length === 0) {
    return true;
  }

  // Storage deletion cannot share a transaction with Postgres. Re-read all
  // references immediately before removal to narrow the remaining TOCTOU
  // window and retain anything another editor referenced after the first read.
  const latestReferences = await loadAdminMediaReferences(supabase);
  if (!latestReferences) {
    return false;
  }

  return removeAdminFiles(
    supabase,
    initiallyUnreferenced.filter((url) => !latestReferences.has(url))
  );
}

/**
 * Requests revalidation of cached public pages with the current admin session.
 *
 * Public pages also have a five-minute fallback. Revalidation therefore
 * returns `false` on failure instead of turning a successful CMS mutation into
 * a failed save.
 */
export async function revalidateAdminPublicContent(supabase: SupabaseClient) {
  try {
    const {
      data: { session }
    } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    if (!accessToken) {
      return false;
    }

    const response = await fetch("/api/admin/revalidate", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    return response.ok;
  } catch {
    return false;
  }
}
