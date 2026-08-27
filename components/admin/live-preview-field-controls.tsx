"use client";

import {
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
  useEffect,
  useRef,
  useState
} from "react";
import { PenSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export type PreviewEditableField =
  | "business"
  | "title"
  | "slug"
  | "category"
  | "shortDescription"
  | "fullDescription"
  | "carModel"
  | "location"
  | "year"
  | "behindTheScenes"
  | "coverImage"
  | "videoUrl"
  | "uploadedVideo"
  | "createdAt"
  | "galleryCaption"
  | "galleryAlt";

export type PreviewToggleField = "published" | "featured";

type EditablePreviewFieldProps = {
  fieldKey: PreviewEditableField;
  value: string;
  placeholder: string;
  onCommit: (field: PreviewEditableField, value: string) => void;
  kind?: "input" | "textarea" | "select";
  options?: string[];
  rows?: number;
  wrapperClassName?: string;
  displayClassName?: string;
  inputClassName?: string;
  emptyClassName?: string;
};

export function EditablePreviewField({
  fieldKey,
  value,
  placeholder,
  onCommit,
  kind = "input",
  options = [],
  rows = 4,
  wrapperClassName,
  displayClassName,
  inputClassName,
  emptyClassName
}: EditablePreviewFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null
  >(null);

  useEffect(() => {
    if (!isEditing) return;

    const node = inputRef.current;
    if (!node) return;

    requestAnimationFrame(() => {
      node.focus();
      if (
        node instanceof HTMLInputElement ||
        node instanceof HTMLTextAreaElement
      ) {
        node.select();
      }
    });
  }, [isEditing]);

  function openEditor() {
    setDraft(value);
    setIsEditing(true);
  }

  function commit(nextValue = draft) {
    onCommit(fieldKey, nextValue.trim());
    setIsEditing(false);
  }

  function cancel() {
    setDraft(value);
    setIsEditing(false);
  }

  function handleKeyDown(
    event: ReactKeyboardEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    if (event.key === "Escape") {
      event.preventDefault();
      cancel();
      return;
    }

    if (kind !== "textarea" && event.key === "Enter") {
      event.preventDefault();
      commit();
      return;
    }

    if (
      kind === "textarea" &&
      event.key === "Enter" &&
      (event.metaKey || event.ctrlKey)
    ) {
      event.preventDefault();
      commit();
    }
  }

  if (isEditing) {
    if (kind === "textarea") {
      return (
        <div className={wrapperClassName}>
          <textarea
            ref={inputRef as RefObject<HTMLTextAreaElement>}
            value={draft}
            rows={rows}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={() => commit()}
            onKeyDown={handleKeyDown}
            className={cn(
              "textarea-field min-h-[7rem] w-full resize-none text-sm leading-7",
              inputClassName
            )}
          />
        </div>
      );
    }

    if (kind === "select") {
      return (
        <div className={wrapperClassName}>
          <select
            ref={inputRef as RefObject<HTMLSelectElement>}
            value={draft}
            onChange={(event) => {
              const nextValue = event.target.value;
              setDraft(nextValue);
              commit(nextValue);
            }}
            onBlur={() => setIsEditing(false)}
            onKeyDown={handleKeyDown}
            className={cn("input-field w-full text-sm", inputClassName)}
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div className={wrapperClassName}>
        <input
          ref={inputRef as RefObject<HTMLInputElement>}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => commit()}
          onKeyDown={handleKeyDown}
          className={cn("input-field w-full text-sm", inputClassName)}
        />
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openEditor}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openEditor();
        }
      }}
      aria-label={`Edit ${placeholder}`}
      title="Click to edit"
      className={cn(
        "group/edit relative cursor-text rounded-xl border border-transparent transition-colors",
        "hover:border-line/80 hover:bg-panel-secondary/60",
        "focus-visible:bg-panel-secondary/60 focus-visible:border-focus-ring focus-visible:outline-none",
        wrapperClassName
      )}
    >
      <PenSquare className="absolute right-2 top-2 h-3.5 w-3.5 text-accent-text opacity-0 transition-opacity group-hover/edit:opacity-100 group-focus-visible/edit:opacity-100" />
      <span
        className={cn(
          value ? "text-current" : "italic text-muted",
          value ? displayClassName : (emptyClassName ?? displayClassName)
        )}
      >
        {value || placeholder}
      </span>
    </div>
  );
}

type PreviewToggleChipProps = {
  active: boolean;
  label: string;
  onClick: () => void;
  activeClassName: string;
  inactiveClassName: string;
  highlighted?: boolean;
  onHoverChange?: (active: boolean) => void;
};

export function PreviewToggleChip({
  active,
  label,
  onClick,
  activeClassName,
  inactiveClassName,
  highlighted = false,
  onHoverChange
}: PreviewToggleChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
      onFocus={() => onHoverChange?.(true)}
      onBlur={() => onHoverChange?.(false)}
      className={cn(
        "rounded-full border px-2.5 py-1 text-[0.6rem] uppercase tracking-eyebrow backdrop-blur-sm transition-colors",
        highlighted ? "border-accent/60" : "border-transparent",
        active ? activeClassName : inactiveClassName
      )}
    >
      {label}
    </button>
  );
}
