import type { SupabaseClient } from "@supabase/supabase-js";
import type { buildProjectDatabasePayload } from "@/lib/admin-persistence";
import type { AdminProjectListItem } from "@/lib/admin-types";
import { resolveAdminMutationResult } from "@/lib/admin-optimistic-mutation";
import {
  adminFailure,
  adminSuccess,
  type AdminResult
} from "@/lib/admin-result";
import { normalizeProjectRecord } from "@/lib/supabase";
import { toAdminProjectListItem } from "@/lib/admin-utils";

type ProjectDatabasePayload = ReturnType<typeof buildProjectDatabasePayload>;

export type AdminProjectSlugMatch = {
  id: string;
  title: string;
  slug: string;
};

/**
 * Replaces a matching project in the admin list or prepends a newly inserted
 * project. Matching by both ID and slug prevents duplicates after renames.
 */
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

/**
 * Loads every project visible to the authenticated administrator and maps raw
 * database rows to the form-friendly admin representation.
 *
 * @returns A discriminated `AdminResult`; repository errors are values rather
 * than thrown exceptions.
 */
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

/**
 * Checks whether a normalized slug is already used by another project.
 *
 * `excludeProjectId` allows an existing project to keep its current slug.
 */
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

/**
 * Inserts a new project or updates an existing one based on `payload.id`.
 *
 * When `expectedUpdatedAt` is present, the update succeeds only if the database
 * row still has that timestamp. A missing returned row is reported as a stale
 * edit instead of silently overwriting another browser tab.
 */
export async function saveAdminProjectRecord(
  supabase: SupabaseClient,
  payload: ProjectDatabasePayload,
  options?: { expectedUpdatedAt?: string }
): Promise<AdminResult<AdminProjectListItem>> {
  const { id, ...changes } = payload;
  const result = id
    ? await (() => {
        let query = supabase.from("projects").update(changes).eq("id", id);

        if (options?.expectedUpdatedAt) {
          query = query.eq("updated_at", options.expectedUpdatedAt);
        }

        return query.select("*").maybeSingle();
      })()
    : await supabase.from("projects").insert(changes).select("*").single();

  return resolveAdminMutationResult(result, {
    operationFallback: "The project could not be saved.",
    staleMessage:
      "This project was changed in another browser tab. Reload it before saving so those changes are not overwritten.",
    mapData: (data) => toAdminProjectListItem(normalizeProjectRecord(data))
  });
}

/**
 * Deletes a project with the same optimistic-concurrency protection used by
 * saving.
 *
 * This removes only the database row. The orchestration layer separately
 * checks and removes media that is no longer referenced anywhere.
 */
export async function deleteAdminProjectRecord(
  supabase: SupabaseClient,
  projectId: string,
  expectedUpdatedAt?: string
): Promise<AdminResult<null>> {
  let query = supabase.from("projects").delete().eq("id", projectId);

  if (expectedUpdatedAt) {
    query = query.eq("updated_at", expectedUpdatedAt);
  }

  const result = await query.select("id").maybeSingle();

  return resolveAdminMutationResult(result, {
    operationFallback: "The project could not be deleted.",
    staleMessage:
      "This project changed in another browser tab. Reload it before deleting so those changes can be reviewed.",
    mapData: () => null
  });
}
