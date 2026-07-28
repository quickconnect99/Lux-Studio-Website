import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_BUCKET } from "@/lib/supabase";

export type AdminStorageFolder =
  | "about-team"
  | "about-team-gallery"
  | "covers"
  | "gallery"
  | "selected-frames"
  | "videos";

export async function uploadAdminFile(
  supabase: SupabaseClient,
  file: File,
  folder: AdminStorageFolder
) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const filePath = `${folder}/${crypto.randomUUID()}.${extension}`;
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

  const {
    data: { publicUrl }
  } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(filePath);

  return publicUrl;
}

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
    references.add(value.trim());
    value
      .split(/\s*(?:\||->)\s*/)
      .map((part) => part.trim())
      .filter(Boolean)
      .forEach((part) => references.add(part));
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

export async function removeUnreferencedAdminFiles(
  supabase: SupabaseClient,
  candidateUrls: string[]
) {
  const candidates = Array.from(new Set(candidateUrls.filter(Boolean)));

  if (candidates.length === 0) {
    return true;
  }

  const [projectsResult, settingsResult] = await Promise.all([
    supabase
      .from("projects")
      .select("cover_image, gallery_images, gallery_items, uploaded_video"),
    supabase
      .from("site_settings")
      .select(
        "hero_video_url, selected_frames, motion_frames, about_team_images, about_team_members"
      )
  ]);

  if (projectsResult.error || settingsResult.error) {
    return false;
  }

  const references = new Set<string>();
  collectReferencedStrings(projectsResult.data, references);
  collectReferencedStrings(settingsResult.data, references);

  return removeAdminFiles(
    supabase,
    candidates.filter((url) => !references.has(url))
  );
}

// Public pages also have a five-minute revalidation fallback. An unavailable
// revalidation endpoint must therefore never turn a successful CMS mutation
// into a failed save.
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
