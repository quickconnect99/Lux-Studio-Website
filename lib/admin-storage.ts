import type { SupabaseClient } from "@supabase/supabase-js";
import { slugify } from "@/lib/admin-utils";
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
  const filePath = `${folder}/${Date.now()}-${slugify(file.name)}`;
  const { error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .upload(filePath, file, { upsert: true });

  if (error) {
    throw error;
  }

  const {
    data: { publicUrl }
  } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(filePath);

  return publicUrl;
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
