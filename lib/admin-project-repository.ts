import type { SupabaseClient } from "@supabase/supabase-js";
import type { buildProjectDatabasePayload } from "@/lib/admin-persistence";
import type { AdminProjectListItem } from "@/lib/admin-types";
import {
  normalizeProjectRecord
} from "@/lib/supabase";
import { toAdminProjectListItem } from "@/lib/admin-utils";

type ProjectDatabasePayload = ReturnType<
  typeof buildProjectDatabasePayload
>;

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

export async function loadAdminProjects(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  return (data ?? [])
    .map((item) => normalizeProjectRecord(item))
    .map(toAdminProjectListItem);
}

export async function saveAdminProjectRecord(
  supabase: SupabaseClient,
  payload: ProjectDatabasePayload
) {
  const { data, error } = await supabase
    .from("projects")
    .upsert(payload, { onConflict: "slug" })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return toAdminProjectListItem(normalizeProjectRecord(data));
}

export async function deleteAdminProjectRecord(
  supabase: SupabaseClient,
  projectId: string
) {
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) {
    throw error;
  }
}
