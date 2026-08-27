"use client";

import { FieldError } from "@/components/ui/field-error";
import { EditorFieldShell } from "@/components/admin/field-highlight-shell";
import { FieldLabel } from "@/components/admin/project-editor-field-controls";
import type {
  AdminProjectFieldKey,
  ProjectFormState,
  SlugValidationState
} from "@/lib/admin-types";
import { businesses, categories, slugify } from "@/lib/admin-utils";
import { cn } from "@/lib/utils";

type Props = {
  formState: ProjectFormState;
  updateField: <K extends keyof ProjectFormState>(
    key: K,
    value: ProjectFormState[K]
  ) => void;
  slugValidation: SlugValidationState;
  onSlugBlur: () => void;
  onApplySuggestedSlug: () => void;
  activeField: AdminProjectFieldKey | null;
  onActiveFieldChange: (field: AdminProjectFieldKey | null) => void;
};

/**
 * Project identity (title/slug/category metadata) and the narrative copy
 * fields — everything a new project needs before media is attached.
 */
export function ProjectEditorBasicsPanel({
  formState,
  updateField,
  slugValidation,
  onSlugBlur,
  onApplySuggestedSlug,
  activeField,
  onActiveFieldChange
}: Props) {
  return (
    <>
      <div
        data-admin-editor-section="basics"
        className="mt-6 border-l-2 border-accent pl-3"
      >
        <p className="text-xs font-medium uppercase tracking-eyebrow text-foreground">
          01 · Basics
        </p>
        <p className="mt-1 text-sm text-muted">
          Project identity, URL and primary metadata.
        </p>
      </div>

      {/* Title + Slug */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <EditorFieldShell
          fieldKey="title"
          activeField={activeField}
          onActiveFieldChange={onActiveFieldChange}
        >
          <label className="space-y-2 text-sm text-muted">
            <FieldLabel fieldKey="title" required />
            <input
              data-admin-project-title
              required
              value={formState.title}
              onChange={(e) => {
                const value = e.target.value;
                updateField("title", value);
                updateField("slug", slugify(value));
              }}
              className="input-field"
            />
          </label>
        </EditorFieldShell>
        <EditorFieldShell
          fieldKey="slug"
          activeField={activeField}
          onActiveFieldChange={onActiveFieldChange}
        >
          <label className="space-y-2 text-sm text-muted">
            <FieldLabel fieldKey="slug" required />
            <input
              required
              value={formState.slug}
              onBlur={onSlugBlur}
              onChange={(e) => updateField("slug", slugify(e.target.value))}
              aria-invalid={slugValidation.status === "conflict"}
              aria-describedby={
                slugValidation.status === "conflict"
                  ? "project-slug-error"
                  : undefined
              }
              className={cn(
                "input-field",
                slugValidation.status === "conflict" ? "field-error" : ""
              )}
            />
            {slugValidation.status === "checking" ? (
              <p className="text-xs leading-6 text-muted">
                Checking slug availability...
              </p>
            ) : null}
            {slugValidation.status === "available" &&
            slugValidation.slug === formState.slug ? (
              <p className="text-xs leading-6 text-success-text">
                Slug is available.
              </p>
            ) : null}
            {slugValidation.status === "conflict" &&
            slugValidation.message ? (
              <div className="space-y-2">
                <FieldError
                  id="project-slug-error"
                  message={slugValidation.message}
                />
                {slugValidation.suggestedSlug ? (
                  <button
                    type="button"
                    onClick={onApplySuggestedSlug}
                    className="inline-flex items-center gap-1.5 text-xs uppercase tracking-eyebrow text-accent-text hover:underline"
                  >
                    Use suggestion: {slugValidation.suggestedSlug}
                  </button>
                ) : null}
              </div>
            ) : null}
          </label>
        </EditorFieldShell>
      </div>

      {/* Category + meta */}
      <div className="mt-4 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <EditorFieldShell
          fieldKey="business"
          activeField={activeField}
          onActiveFieldChange={onActiveFieldChange}
        >
          <label className="space-y-2 text-sm text-muted">
            <FieldLabel fieldKey="business" />
            <input
              list="project-business-options"
              value={formState.business}
              onChange={(e) =>
                updateField(
                  "business",
                  e.target.value as ProjectFormState["business"]
                )
              }
              className="input-field"
              placeholder="Automotive, Hospitality, Event..."
            />
            <datalist id="project-business-options">
              {businesses.map((business) => (
                <option key={business} value={business}>
                  {business}
                </option>
              ))}
            </datalist>
          </label>
        </EditorFieldShell>
        <EditorFieldShell
          fieldKey="category"
          activeField={activeField}
          onActiveFieldChange={onActiveFieldChange}
        >
          <label className="space-y-2 text-sm text-muted">
            <FieldLabel fieldKey="category" />
            <input
              list="project-category-options"
              value={formState.category}
              onChange={(e) => updateField("category", e.target.value)}
              className="input-field"
              placeholder="Campaign type, format, product, or occasion"
            />
            <datalist id="project-category-options">
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </datalist>
          </label>
        </EditorFieldShell>
        <EditorFieldShell
          fieldKey="carModel"
          activeField={activeField}
          onActiveFieldChange={onActiveFieldChange}
        >
          <label className="space-y-2 text-sm text-muted">
            <FieldLabel fieldKey="carModel" />
            <input
              value={formState.carModel}
              onChange={(e) => updateField("carModel", e.target.value)}
              className="input-field"
              placeholder="Vehicle, venue, property, or featured subject"
            />
          </label>
        </EditorFieldShell>
        <EditorFieldShell
          fieldKey="location"
          activeField={activeField}
          onActiveFieldChange={onActiveFieldChange}
        >
          <label className="space-y-2 text-sm text-muted">
            <FieldLabel fieldKey="location" required />
            <input
              value={formState.location}
              onChange={(e) => updateField("location", e.target.value)}
              className="input-field"
            />
          </label>
        </EditorFieldShell>
        <EditorFieldShell
          fieldKey="year"
          activeField={activeField}
          onActiveFieldChange={onActiveFieldChange}
        >
          <label className="space-y-2 text-sm text-muted">
            <FieldLabel fieldKey="year" required />
            <input
              value={formState.year}
              onChange={(e) => updateField("year", e.target.value)}
              className="input-field"
            />
          </label>
        </EditorFieldShell>
      </div>

      {/* Descriptions */}
      <div
        data-admin-editor-section="copy"
        className="mt-8 border-l-2 border-accent pl-3"
      >
        <p className="text-xs font-medium uppercase tracking-eyebrow text-foreground">
          02 · Copy
        </p>
        <p className="mt-1 text-sm text-muted">
          Card summary, project description and behind-the-scenes notes.
        </p>
      </div>

      <EditorFieldShell
        fieldKey="shortDescription"
        activeField={activeField}
        onActiveFieldChange={onActiveFieldChange}
        className="mt-4"
      >
        <label className="block space-y-2 text-sm text-muted">
          <FieldLabel fieldKey="shortDescription" required />
          <textarea
            value={formState.shortDescription}
            onChange={(e) => updateField("shortDescription", e.target.value)}
            className="textarea-field min-h-28"
          />
        </label>
      </EditorFieldShell>

      <EditorFieldShell
        fieldKey="fullDescription"
        activeField={activeField}
        onActiveFieldChange={onActiveFieldChange}
        className="mt-4"
      >
        <label className="block space-y-2 text-sm text-muted">
          <FieldLabel fieldKey="fullDescription" required />
          <textarea
            value={formState.fullDescription}
            onChange={(e) => updateField("fullDescription", e.target.value)}
            className="textarea-field min-h-40"
          />
        </label>
      </EditorFieldShell>

      <EditorFieldShell
        fieldKey="behindTheScenes"
        activeField={activeField}
        onActiveFieldChange={onActiveFieldChange}
        className="mt-4"
      >
        <label className="block space-y-2 text-sm text-muted">
          <FieldLabel fieldKey="behindTheScenes" />
          <textarea
            value={formState.behindTheScenes}
            onChange={(e) => updateField("behindTheScenes", e.target.value)}
            className="textarea-field min-h-28"
          />
        </label>
      </EditorFieldShell>
    </>
  );
}
