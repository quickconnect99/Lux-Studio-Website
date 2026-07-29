"use client";

import { useCallback, useEffect, useRef } from "react";
import type { ProjectFormState } from "@/lib/admin-types";
import { restoreProjectDraft } from "@/lib/admin-persistence";
import { DRAFT_STORAGE_KEY } from "@/lib/admin-utils";

type StoredProjectDraft = {
  version: 1;
  projectKey: string;
  baseSnapshot: string;
  updatedAt: string;
  formState: ProjectFormState;
};

function getProjectDraftStorageKey(projectKey: string) {
  return `${DRAFT_STORAGE_KEY}:${encodeURIComponent(projectKey)}`;
}

function parseStoredDraft(value: string | null): StoredProjectDraft | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<StoredProjectDraft>;
    const formState = restoreProjectDraft(parsed.formState);
    if (
      parsed.version !== 1 ||
      typeof parsed.projectKey !== "string" ||
      typeof parsed.baseSnapshot !== "string" ||
      typeof parsed.updatedAt !== "string" ||
      !formState
    ) {
      return null;
    }

    return {
      version: 1,
      projectKey: parsed.projectKey,
      baseSnapshot: parsed.baseSnapshot,
      updatedAt: parsed.updatedAt,
      formState
    };
  } catch {
    return null;
  }
}

/**
 * Persists unsaved project form fields as a project-scoped recovery draft.
 *
 * A draft is restored only when its base snapshot still matches the project
 * that was originally edited. This prevents an old browser draft from silently
 * overwriting a newer database version. Browser-storage failures are ignored so
 * private browsing or storage restrictions never break the editor.
 *
 * File objects are intentionally not stored because `localStorage` can only
 * contain strings; queued media must be selected again after a reload.
 *
 * @returns `clearDraft`, used after save/discard workflows.
 */
export function useAdminDraft({
  enabled,
  projectKey,
  formState,
  isDirty,
  onRestore
}: {
  enabled: boolean;
  projectKey: string;
  formState: ProjectFormState;
  isDirty: boolean;
  onRestore(
    draft: ProjectFormState,
    projectKey: string,
    updatedAt: string
  ): void;
}) {
  const onRestoreRef = useRef(onRestore);
  const formStateRef = useRef(formState);
  const lastCleanSnapshotRef = useRef(JSON.stringify(formState));
  const skipCleanRemovalForKeyRef = useRef<string | null>(null);

  useEffect(() => {
    onRestoreRef.current = onRestore;
    formStateRef.current = formState;
  }, [formState, onRestore]);

  useEffect(() => {
    if (!enabled) return;

    try {
      const currentSnapshot = JSON.stringify(formStateRef.current);
      lastCleanSnapshotRef.current = currentSnapshot;
      const storageKey = getProjectDraftStorageKey(projectKey);
      const stored = parseStoredDraft(localStorage.getItem(storageKey));

      if (
        stored &&
        stored.projectKey === projectKey &&
        stored.baseSnapshot === currentSnapshot &&
        JSON.stringify(stored.formState) !== currentSnapshot
      ) {
        skipCleanRemovalForKeyRef.current = projectKey;
        onRestoreRef.current(stored.formState, projectKey, stored.updatedAt);
        return;
      }

      localStorage.removeItem(storageKey);

      const legacyRaw = localStorage.getItem(DRAFT_STORAGE_KEY);
      const legacyDraft = restoreProjectDraft(
        legacyRaw ? JSON.parse(legacyRaw) : null
      );
      if (legacyDraft) {
        skipCleanRemovalForKeyRef.current = projectKey;
        onRestoreRef.current(legacyDraft, projectKey, new Date().toISOString());
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    } catch {
      // Ignore malformed or unavailable browser storage.
    }
  }, [enabled, projectKey]);

  useEffect(() => {
    if (!enabled) return;

    try {
      const storageKey = getProjectDraftStorageKey(projectKey);
      const currentSnapshot = JSON.stringify(formState);

      if (!isDirty) {
        lastCleanSnapshotRef.current = currentSnapshot;
        if (skipCleanRemovalForKeyRef.current === projectKey) {
          skipCleanRemovalForKeyRef.current = null;
          return;
        }
        localStorage.removeItem(storageKey);
        return;
      }

      const draft: StoredProjectDraft = {
        version: 1,
        projectKey,
        baseSnapshot: lastCleanSnapshotRef.current,
        updatedAt: new Date().toISOString(),
        formState
      };
      localStorage.setItem(storageKey, JSON.stringify(draft));
    } catch {
      // Ignore unavailable browser storage.
    }
  }, [enabled, formState, isDirty, projectKey]);

  const clearDraft = useCallback(
    (targetProjectKey = projectKey) => {
      try {
        localStorage.removeItem(getProjectDraftStorageKey(targetProjectKey));
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        // Ignore unavailable browser storage.
      }
    },
    [projectKey]
  );

  return { clearDraft };
}
