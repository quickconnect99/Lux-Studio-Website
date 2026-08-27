"use client";

import { EditorFieldShell } from "@/components/admin/field-highlight-shell";
import { FieldLabel } from "@/components/admin/project-editor-field-controls";
import type { AdminProjectFieldKey, ProjectFormState } from "@/lib/admin-types";

type Props = {
  formState: ProjectFormState;
  updateField: <K extends keyof ProjectFormState>(
    key: K,
    value: ProjectFormState[K]
  ) => void;
  activeField: AdminProjectFieldKey | null;
  onActiveFieldChange: (field: AdminProjectFieldKey | null) => void;
};

/**
 * Release date, homepage placement, and public visibility.
 */
export function ProjectEditorPublishPanel({
  formState,
  updateField,
  activeField,
  onActiveFieldChange
}: Props) {
  const dateValue = formState.createdAt
    ? formState.createdAt.split("T")[0]
    : "";

  function handleDateChange(dateStr: string) {
    if (!dateStr) return;
    const timePart = formState.createdAt.includes("T")
      ? formState.createdAt.split("T")[1]
      : "12:00:00.000Z";
    updateField("createdAt", `${dateStr}T${timePart}`);
  }

  return (
    <>
      <div
        data-admin-editor-section="publishing"
        className="mt-8 border-l-2 border-accent pl-3"
      >
        <p className="text-xs font-medium uppercase tracking-eyebrow text-foreground">
          05 · Publishing
        </p>
        <p className="mt-1 text-sm text-muted">
          Control release date, homepage placement and public visibility.
        </p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {/* Datepicker for createdAt */}
        <EditorFieldShell
          fieldKey="createdAt"
          activeField={activeField}
          onActiveFieldChange={onActiveFieldChange}
        >
          <div className="space-y-2 text-sm text-muted">
            <FieldLabel fieldKey="createdAt" />
            <input
              type="date"
              aria-label="Project publication date"
              value={dateValue}
              onChange={(e) => handleDateChange(e.target.value)}
              className="input-field"
            />
            <button
              type="button"
              onClick={() =>
                updateField("createdAt", new Date().toISOString())
              }
              className="control-pill text-xs"
            >
              Today
            </button>
          </div>
        </EditorFieldShell>
        <EditorFieldShell
          fieldKey="featured"
          activeField={activeField}
          onActiveFieldChange={onActiveFieldChange}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <FieldLabel fieldKey="featured" />
            </div>
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={formState.featured}
                onChange={(e) => updateField("featured", e.target.checked)}
                className="h-4 w-4"
              />
              Featured project
            </label>
            <p className="px-1 text-xs leading-6 text-muted">
              Appears in the curated homepage highlights.
            </p>
          </div>
        </EditorFieldShell>
        <EditorFieldShell
          fieldKey="published"
          activeField={activeField}
          onActiveFieldChange={onActiveFieldChange}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <FieldLabel fieldKey="published" />
            </div>
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={formState.published}
                onChange={(e) => updateField("published", e.target.checked)}
                className="h-4 w-4"
              />
              Published
            </label>
            <p className="px-1 text-xs leading-6 text-muted">
              Makes the project visible on the public site.
            </p>
          </div>
        </EditorFieldShell>
      </div>
    </>
  );
}
