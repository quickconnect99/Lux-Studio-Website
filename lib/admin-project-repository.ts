import type { SupabaseClient } from "@supabase/supabase-js";
import type { buildProjectDatabasePayload } from "@/lib/admin-persistence";
import type { AdminProjectListItem } from "@/lib/admin-types";
import {
  adminFailure,
  adminSuccess,
  type AdminResult
} from "@/lib/admin-result";
import {
  normalizeProjectRecord
} from "@/lib/supabase";
import { toAdminProjectListItem } from "@/lib/admin-utils";

type ProjectDatabasePayload = ReturnType<
  typeof buildProjectDatabasePayload
>;

export type AdminProjectSlugMatch = {
  id: string;
  title: string;
  slug: string;
};

export function mergeAdminProjectList(
  projects: AdminProjectListItem[],
  saved: AdminProjectListItem,
  options?: { sortByCreatedAt?: boolean }
) {
  const next = [
    saved,
    ...projects.filter((project) => {
      const sameId = Boolean(saved.id) && project.id === saved.id;
      return !sameId && project.slug !== saved.slug;
    })
  ];

  return options?.sortByCreatedAt
    ? next.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : next;
}

export function removeAdminProjectFromList(
  projects: AdminProjectListItem[],
  projectId: string
) {
  return projects.filter((project) => project.id !== projectId);
}

export async function loadAdminProjects(
  supabase: SupabaseClient
): Promise<AdminResult<AdminProjectListItem[]>> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return adminFailure(error, "Projects could not be loaded.");
  }

  return adminSuccess(
    (data ?? [])
      .map((item) => normalizeProjectRecord(item))
      .map(toAdminProjectListItem)
  );
}

export async function findAdminProjectBySlug(
  supabase: SupabaseClient,
  slug: string,
  excludeProjectId?: string
): Promise<AdminResult<AdminProjectSlugMatch | null>> {
  let query = supabase
    .from("projects")
    .select("id, title, slug")
    .eq("slug", slug);

  if (excludeProjectId) {
    query = query.neq("id", excludeProjectId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) {
    return adminFailure(error, "Slug availability could not be verified.");
  }

  return adminSuccess(data);
}

export async function saveAdminProjectRecord(
  supabase: SupabaseClient,
  payload: ProjectDatabasePayload
): Promise<AdminResult<AdminProjectListItem>> {
  const { data, error } = await supabase
    .from("projects")
    .upsert(payload, { onConflict: "slug" })
    .select("*")
    .single();

  if (error) {
    return adminFailure(error, "The project could not be saved.");
  }

  return adminSuccess(toAdminProjectListItem(normalizeProjectRecord(data)));
}

export async function deleteAdminProjectRecord(
  supabase: SupabaseClient,
  projectId: string
): Promise<AdminResult<null>> {
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) {
    return adminFailure(error, "The project could not be deleted.");
  }

  return adminSuccess(null);
}
