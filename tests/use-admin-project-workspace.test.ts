import "./dom-setup";
import assert from "node:assert/strict";
import test from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { act, renderHook } from "@testing-library/react";
import { useAdminProjectWorkspace } from "../hooks/use-admin-project-workspace";
import type { AdminProjectListItem } from "../lib/admin-types";

function project(
  slug: string,
  overrides: Partial<AdminProjectListItem> = {}
): AdminProjectListItem {
  return {
    adminKey: `project:${slug}`,
    business: "Automotive",
    title: slug,
    slug,
    shortDescription: "Short",
    fullDescription: "Full",
    category: "Brand Film",
    carModel: "Model",
    location: "Location",
    year: 2026,
    coverImage: "/cover.jpg",
    galleryImages: [],
    featured: false,
    published: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides
  };
}

const defaultTemplate = project("template", {
  adminKey: "template:automotive",
  isTemplate: true
});

function renderWorkspace(
  options: Partial<{
    supabase: SupabaseClient | null;
    sessionEmail: string | null;
    projects: AdminProjectListItem[];
    working: boolean;
  }> = {}
) {
  const calls: string[] = [];
  const statusMessages: string[] = [];

  const view = renderHook(() =>
    useAdminProjectWorkspace({
      supabase: options.supabase ?? null,
      sessionEmail: options.sessionEmail ?? null,
      projects: options.projects ?? [],
      templateProjects: [defaultTemplate],
      defaultTemplate,
      coverFile: null,
      galleryFiles: [],
      videoFile: null,
      coverPreviewUrl: null,
      working: options.working ?? false,
      clearProjectMedia: () => calls.push("clearProjectMedia"),
      clearSaveReport: () => calls.push("clearSaveReport"),
      showStatus: (message) => statusMessages.push(message)
    })
  );

  return { ...view, calls, statusMessages };
}

test("starts from the default template with a clean, non-dirty form", () => {
  const { result } = renderWorkspace();

  assert.equal(result.current.formState.title, defaultTemplate.title);
  assert.equal(result.current.isDirty, false);
  assert.equal(result.current.isTemplateProject, false);
});

test("updateField marks the form dirty and clears the save report", () => {
  const { result, calls } = renderWorkspace();

  act(() => {
    result.current.updateField("title", "Edited title");
  });

  assert.equal(result.current.formState.title, "Edited title");
  assert.equal(result.current.isDirty, true);
  assert.ok(calls.includes("clearSaveReport"));
});

test("selectProject loads the project into the form and resets dirty state", () => {
  const existing = project("existing-project", { id: "existing-id" });
  const { result } = renderWorkspace({ projects: [existing] });

  act(() => {
    result.current.updateField("title", "Unsaved change");
  });
  assert.equal(result.current.isDirty, true);

  act(() => {
    result.current.selectProject(existing);
  });

  assert.equal(result.current.formState.title, existing.title);
  assert.equal(result.current.isDirty, false);
  assert.equal(result.current.selectedProjectKey, existing.adminKey);
});

test("duplicateProject appends -copy to the slug and unpublishes the copy", () => {
  const existing = project("existing-project", {
    id: "existing-id",
    published: true
  });
  const { result } = renderWorkspace({ projects: [existing] });

  act(() => {
    result.current.selectProject(existing);
  });
  act(() => {
    result.current.duplicateProject();
  });

  assert.equal(result.current.formState.slug, "existing-project-copy");
  assert.equal(result.current.formState.title, "existing-project (Copy)");
  assert.equal(result.current.formState.published, false);
  assert.equal(result.current.isDirty, true);
});

test("checkSlugAvailability detects a local slug conflict and suggests an alternative", async () => {
  const existing = project("taken-slug", { id: "existing-id" });
  const { result } = renderWorkspace({ projects: [existing] });

  act(() => {
    result.current.updateField("slug", "taken-slug");
  });

  const outcome = await act(async () =>
    result.current.checkSlugAvailability("taken-slug")
  );

  assert.equal(outcome.ok, false);
  assert.equal(result.current.slugValidation.status, "conflict");
  assert.ok(result.current.slugValidation.suggestedSlug);
});

test("checkSlugAvailability accepts a unique slug with no local or remote conflict", async () => {
  const { result } = renderWorkspace();

  const outcome = await act(async () =>
    result.current.checkSlugAvailability("brand-new-slug")
  );

  assert.equal(outcome.ok, true);
  assert.equal(result.current.slugValidation.status, "available");
});

test("handleResetClick opens a confirmation dialog only when the form is dirty", () => {
  const { result } = renderWorkspace();

  act(() => {
    result.current.handleResetClick();
  });
  const dialogWhileClean = result.current.confirmDialog;
  assert.equal(dialogWhileClean, null);

  act(() => {
    result.current.updateField("title", "Unsaved change");
  });
  act(() => {
    result.current.handleResetClick();
  });

  const dialogWhileDirty = result.current.confirmDialog;
  assert.equal(dialogWhileDirty?.action, "reset");
});

test("resolveConfirmDialogAction requires an exact title match before deleting a published project", () => {
  const published = project("published-project", {
    id: "published-id",
    published: true
  });
  const { result, statusMessages } = renderWorkspace({ projects: [published] });

  act(() => {
    result.current.selectProject(published);
  });
  act(() => {
    result.current.openDeleteDialog();
  });
  assert.equal(result.current.confirmDialog?.action, "delete");

  let rejected: "delete" | null = null;
  act(() => {
    rejected = result.current.resolveConfirmDialogAction();
  });
  assert.equal(rejected, null);
  assert.ok(
    statusMessages.some((message) => message.includes("Type the project title"))
  );

  act(() => {
    result.current.updateConfirmDialogInput(published.title);
  });
  let accepted: "delete" | null = null;
  act(() => {
    accepted = result.current.resolveConfirmDialogAction();
  });
  assert.equal(accepted, "delete");
});

test("commitSavedProject replaces the dirty draft with the confirmed saved state", () => {
  const { result } = renderWorkspace();

  act(() => {
    result.current.updateField("title", "Draft title");
  });
  assert.equal(result.current.isDirty, true);

  const saved = project("draft-title", {
    id: "new-id",
    title: "Draft title"
  });

  act(() => {
    result.current.commitSavedProject(saved);
  });

  assert.equal(result.current.isDirty, false);
  assert.equal(result.current.saveCount, 1);
  assert.equal(result.current.selectedProjectKey, saved.adminKey);
});
