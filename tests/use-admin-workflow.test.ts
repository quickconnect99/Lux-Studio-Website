import "./dom-setup";
import assert from "node:assert/strict";
import test from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { act, renderHook } from "@testing-library/react";
import { useAdminWorkflow } from "../hooks/use-admin-workflow";
import { createEmptyProject } from "../lib/admin-utils";
import type { AdminProjectListItem, AdminTab } from "../lib/admin-types";

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

const defaultTemplate = project("template", { adminKey: "template:auto" });

function renderWorkflow(
  overrides: Partial<{
    activeTab: AdminTab;
    working: boolean;
    isDirty: boolean;
    isSettingsDirty: boolean;
    isProjectComplete: boolean;
    completionIssues: string[];
    formState: ReturnType<typeof createEmptyProject>;
    projects: AdminProjectListItem[];
    supabase: SupabaseClient | null;
    sessionEmail: string | null;
    checkSlugAvailability: () => Promise<{
      ok: boolean;
      slug: string;
      suggestedSlug?: string | null;
    }>;
    handleSaveSiteSettings: () => Promise<boolean>;
  }> = {}
) {
  const calls: string[] = [];
  const statusMessages: string[] = [];
  const projectsState = { current: overrides.projects ?? [] };

  const view = renderHook(() =>
    useAdminWorkflow({
      supabase: overrides.supabase ?? null,
      sessionEmail: overrides.sessionEmail ?? null,
      activeTab: overrides.activeTab ?? "projects",
      working: overrides.working ?? false,
      tryStartWorking: () => {
        calls.push("tryStartWorking");
        return true;
      },
      finishWorking: () => calls.push("finishWorking"),
      showStatus: (message) => {
        calls.push("showStatus");
        statusMessages.push(message);
      },
      setStatusMessage: (message) => {
        calls.push("setStatusMessage");
        statusMessages.push(message);
      },
      setSaveReport: () => calls.push("setSaveReport"),
      setUploadProgress: () => calls.push("setUploadProgress"),
      projects: projectsState.current,
      setProjects: (next) => {
        calls.push("setProjects");
        projectsState.current = next;
      },
      defaultTemplate,
      applyProject: (target) => calls.push(`applyProject:${target.adminKey}`),
      formState: overrides.formState ?? createEmptyProject(),
      selectedProjectKey: "draft:new-project",
      completionIssues: overrides.completionIssues ?? [],
      isProjectComplete: overrides.isProjectComplete ?? true,
      isDirty: overrides.isDirty ?? false,
      checkSlugAvailability:
        overrides.checkSlugAvailability ??
        (async () => ({ ok: true, slug: "new-project" })),
      commitSavedProject: () => calls.push("commitSavedProject"),
      resolveProjectConfirmDialogAction: () => {
        calls.push("resolveProjectConfirmDialogAction");
        return null;
      },
      projectConfirmDialog: null,
      closeProjectConfirmDialog: () => calls.push("closeProjectConfirmDialog"),
      updateProjectConfirmDialogInput: (value) =>
        calls.push(`updateProjectConfirmDialogInput:${value}`),
      selectProjectImmediately: (target) =>
        calls.push(`selectProjectImmediately:${target.adminKey}`),
      newProjectImmediately: () => calls.push("newProjectImmediately"),
      handleProjectResetClick: () => calls.push("handleProjectResetClick"),
      coverFile: null,
      galleryFiles: [],
      videoFile: null,
      clearProjectMedia: () => calls.push("clearProjectMedia"),
      clearDraft: (key) => calls.push(`clearDraft:${key}`),
      isSettingsDirty: overrides.isSettingsDirty ?? false,
      handleSaveSiteSettings:
        overrides.handleSaveSiteSettings ??
        (async () => {
          calls.push("handleSaveSiteSettings");
          return true;
        }),
      resetSiteSettings: () => calls.push("resetSiteSettings"),
      handleSignOutImmediately: async () => {
        calls.push("handleSignOutImmediately");
      }
    })
  );

  return { ...view, calls, statusMessages };
}

test("selectProject switches immediately when the form is clean", () => {
  const { result, calls } = renderWorkflow({ isDirty: false });
  const target = project("target");

  act(() => {
    result.current.selectProject(target);
  });

  assert.ok(calls.includes("selectProjectImmediately:project:target"));
  assert.equal(result.current.confirmDialog, null);
});

test("selectProject opens a workflow confirmation when the form is dirty, without switching yet", () => {
  const { result, calls } = renderWorkflow({ isDirty: true });
  const target = project("target");

  act(() => {
    result.current.selectProject(target);
  });

  assert.ok(!calls.includes("selectProjectImmediately:project:target"));
  assert.equal(result.current.confirmDialog?.action, "workflow");
  assert.match(result.current.confirmDialog!.description, /target/);
});

test("confirmDialogAction on a pending switch saves the project first, then switches", async () => {
  const { result, calls } = renderWorkflow({
    isDirty: true,
    isProjectComplete: true
  });
  const target = project("target");

  act(() => {
    result.current.selectProject(target);
  });

  await act(async () => {
    await result.current.confirmDialogAction();
  });

  assert.ok(calls.includes("clearDraft:draft:new-project"));
  assert.ok(calls.includes("selectProjectImmediately:project:target"));
  assert.equal(result.current.confirmDialog, null);
});

test("secondaryDialogAction discards the pending switch without saving", async () => {
  const { result, calls } = renderWorkflow({ isDirty: true });
  const target = project("target");

  act(() => {
    result.current.selectProject(target);
  });

  await act(async () => {
    await result.current.secondaryDialogAction();
  });

  assert.ok(!calls.includes("setProjects"));
  assert.ok(calls.includes("selectProjectImmediately:project:target"));
  assert.equal(result.current.confirmDialog, null);
});

test("newProject behaves like selectProject: guarded only while dirty", () => {
  const clean = renderWorkflow({ isDirty: false });
  act(() => {
    clean.result.current.newProject();
  });
  assert.ok(clean.calls.includes("newProjectImmediately"));
  assert.equal(clean.result.current.confirmDialog, null);

  const dirty = renderWorkflow({ isDirty: true });
  act(() => {
    dirty.result.current.newProject();
  });
  assert.ok(!dirty.calls.includes("newProjectImmediately"));
  assert.equal(dirty.result.current.confirmDialog?.action, "workflow");
});

test("handleResetClick delegates to the project workspace while on the projects tab", () => {
  const { result, calls } = renderWorkflow({ activeTab: "projects" });

  act(() => {
    result.current.handleResetClick();
  });

  assert.ok(calls.includes("handleProjectResetClick"));
});

test("handleResetClick resets settings directly when they are clean", () => {
  const { result, calls } = renderWorkflow({
    activeTab: "settings",
    isSettingsDirty: false
  });

  act(() => {
    result.current.handleResetClick();
  });

  assert.ok(calls.includes("resetSiteSettings"));
  assert.equal(result.current.confirmDialog, null);
});

test("handleResetClick confirms before resetting dirty settings", () => {
  const { result, calls } = renderWorkflow({
    activeTab: "settings",
    isSettingsDirty: true
  });

  act(() => {
    result.current.handleResetClick();
  });

  assert.ok(!calls.includes("resetSiteSettings"));
  assert.equal(result.current.confirmDialog?.confirmLabel, "Reset settings");
});

test("handleResetClick is a no-op while a save is already in flight", () => {
  const { result, calls } = renderWorkflow({
    activeTab: "projects",
    working: true
  });

  act(() => {
    result.current.handleResetClick();
  });

  assert.ok(!calls.includes("handleProjectResetClick"));
});

test("handleSignOut signs out immediately when nothing is dirty", () => {
  const { result, calls } = renderWorkflow({
    isDirty: false,
    isSettingsDirty: false
  });

  act(() => {
    result.current.handleSignOut();
  });

  assert.ok(calls.includes("handleSignOutImmediately"));
});

test("handleSignOut confirms with a 'both' scope when project and settings are dirty", () => {
  const { result, calls } = renderWorkflow({
    isDirty: true,
    isSettingsDirty: true
  });

  act(() => {
    result.current.handleSignOut();
  });

  assert.ok(!calls.includes("handleSignOutImmediately"));
  assert.equal(result.current.confirmDialog?.secondaryLabel, "Discard changes");
});

test("closeConfirmDialog is ignored while working, and clears the workflow dialog otherwise", () => {
  const busy = renderWorkflow({ isDirty: true, working: true });
  act(() => {
    busy.result.current.selectProject(project("target"));
  });
  act(() => {
    busy.result.current.closeConfirmDialog();
  });
  assert.ok(
    busy.result.current.confirmDialog,
    "a working save must not let the dialog be dismissed"
  );

  const idle = renderWorkflow({ isDirty: true, working: false });
  act(() => {
    idle.result.current.selectProject(project("target"));
  });
  act(() => {
    idle.result.current.closeConfirmDialog();
  });
  assert.equal(idle.result.current.confirmDialog, null);
});

test("handleSave rejects an incomplete project without touching persistence", async () => {
  const { result, calls, statusMessages } = renderWorkflow({
    isProjectComplete: false,
    completionIssues: ["title"]
  });

  const saved = await act(async () => result.current.handleSave());

  assert.equal(saved, false);
  assert.ok(!calls.includes("setProjects"));
  assert.ok(statusMessages.some((message) => message.includes("title")));
});

test("handleSave stops on a slug conflict before writing anything", async () => {
  const { result, calls, statusMessages } = renderWorkflow({
    checkSlugAvailability: async () => ({ ok: false, slug: "taken" })
  });

  const saved = await act(async () => result.current.handleSave());

  assert.equal(saved, false);
  assert.ok(!calls.includes("setProjects"));
  assert.ok(
    statusMessages.some((message) => message.includes("slug conflict"))
  );
});

test("handleSave persists locally and clears queued media when Supabase is not connected", async () => {
  const { result, calls } = renderWorkflow({ supabase: null });

  const saved = await act(async () => result.current.handleSave());

  assert.equal(saved, true);
  assert.ok(calls.includes("setProjects"));
  assert.ok(calls.includes("commitSavedProject"));
  assert.ok(calls.includes("clearProjectMedia"));
  assert.ok(calls.includes("setSaveReport"));
  assert.ok(calls.includes("finishWorking"));
});
