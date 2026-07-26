"use client";

import { useCallback, useEffect, useRef } from "react";
import type { ProjectFormState } from "@/lib/admin-types";
import { restoreProjectDraft } from "@/lib/admin-persistence";
import { DRAFT_STORAGE_KEY } from "@/lib/admin-utils";

export function useAdminDraft({
  enabled,
  sessionEmail,
  formState,
  onRestore
}: {
  enabled: boolean;
  sessionEmail: string | null;
  formState: ProjectFormState;
  onRestore(draft: ProjectFormState): void;
}) {
  const onRestoreRef = useRef(onRestore);
  onRestoreRef.current = onRestore;

  useEffect(() => {
    if (!enabled) return;

    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return;

      const restoredDraft = restoreProjectDraft(JSON.parse(raw));
      if (restoredDraft) onRestoreRef.current(restoredDraft);
    } catch {
      // Ignore malformed or unavailable browser storage.
    }
  }, [enabled]);

  useEffect(() => {
    if (sessionEmail) return;

    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formState));
    } catch {
      // Ignore unavailable browser storage.
    }
  }, [formState, sessionEmail]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Ignore unavailable browser storage.
    }
  }, []);

  return { clearDraft };
}
