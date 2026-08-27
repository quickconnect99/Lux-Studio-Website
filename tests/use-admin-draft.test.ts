import "./dom-setup";
import assert from "node:assert/strict";
import test from "node:test";
import { act, renderHook } from "@testing-library/react";
import { useAdminDraft } from "../hooks/use-admin-draft";
import { createEmptyProject } from "../lib/admin-utils";
import type { ProjectFormState } from "../lib/admin-types";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

test.beforeEach(() => {
  localStorage.clear();
});

test("persists a debounced draft while dirty, and clears storage once clean again", async () => {
  const clean = createEmptyProject();
  const dirty: ProjectFormState = { ...clean, title: "Edited title" };
  const restored: Array<[ProjectFormState, string, string]> = [];

  const { rerender } = renderHook(
    ({ formState, isDirty }) =>
      useAdminDraft({
        enabled: true,
        projectKey: "draft:new-project",
        formState,
        isDirty,
        onRestore: (draft, key, updatedAt) =>
          restored.push([draft, key, updatedAt])
      }),
    { initialProps: { formState: clean, isDirty: false } }
  );

  rerender({ formState: dirty, isDirty: true });
  await act(() => wait(400));

  const stored = localStorage.getItem(
    "admin-project-draft:draft%3Anew-project"
  );
  assert.ok(stored, "expected a persisted draft after the debounce delay");
  const parsed = JSON.parse(stored!);
  assert.equal(parsed.formState.title, "Edited title");
  assert.equal(parsed.baseSnapshot, JSON.stringify(clean));

  rerender({ formState: clean, isDirty: false });
  await act(() => wait(10));

  assert.equal(
    localStorage.getItem("admin-project-draft:draft%3Anew-project"),
    null
  );
});

test("restores a stored draft only when its base snapshot matches the current project", async () => {
  const clean = createEmptyProject();
  const staleBaseline = { ...clean, title: "A different loaded project" };

  localStorage.setItem(
    "admin-project-draft:draft%3Anew-project",
    JSON.stringify({
      version: 1,
      projectKey: "draft:new-project",
      baseSnapshot: JSON.stringify(clean),
      updatedAt: "2026-01-01T00:00:00.000Z",
      formState: { ...clean, title: "Recovered edit" }
    })
  );

  const restored: Array<[ProjectFormState, string, string]> = [];
  renderHook(() =>
    useAdminDraft({
      enabled: true,
      projectKey: "draft:new-project",
      formState: staleBaseline,
      isDirty: false,
      onRestore: (draft, key, updatedAt) =>
        restored.push([draft, key, updatedAt])
    })
  );

  assert.equal(
    restored.length,
    0,
    "a draft whose baseSnapshot no longer matches must not be restored"
  );
});

test("restores a stored draft when its base snapshot matches the freshly loaded project", () => {
  const clean = createEmptyProject();

  localStorage.setItem(
    "admin-project-draft:draft%3Anew-project",
    JSON.stringify({
      version: 1,
      projectKey: "draft:new-project",
      baseSnapshot: JSON.stringify(clean),
      updatedAt: "2026-01-01T00:00:00.000Z",
      formState: { ...clean, title: "Recovered edit" }
    })
  );

  const restored: Array<[ProjectFormState, string, string]> = [];
  renderHook(() =>
    useAdminDraft({
      enabled: true,
      projectKey: "draft:new-project",
      formState: clean,
      isDirty: false,
      onRestore: (draft, key, updatedAt) =>
        restored.push([draft, key, updatedAt])
    })
  );

  assert.equal(restored.length, 1);
  assert.equal(restored[0][0].title, "Recovered edit");
  assert.equal(restored[0][1], "draft:new-project");
});

test("clearDraft removes the stored entry for the current project", () => {
  const clean = createEmptyProject();
  localStorage.setItem(
    "admin-project-draft:draft%3Anew-project",
    JSON.stringify({
      version: 1,
      projectKey: "draft:new-project",
      baseSnapshot: JSON.stringify(clean),
      updatedAt: "2026-01-01T00:00:00.000Z",
      formState: clean
    })
  );

  const { result } = renderHook(() =>
    useAdminDraft({
      enabled: false,
      projectKey: "draft:new-project",
      formState: clean,
      isDirty: false,
      onRestore: () => {}
    })
  );

  act(() => {
    result.current.clearDraft();
  });

  assert.equal(
    localStorage.getItem("admin-project-draft:draft%3Anew-project"),
    null
  );
});
