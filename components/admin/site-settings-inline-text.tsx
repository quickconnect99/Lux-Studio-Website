"use client";

import {
  type ChangeEvent,
  type KeyboardEvent,
  type RefObject,
  useEffect,
  useRef,
  useState
} from "react";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

type InlineTextProps = {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  className?: string;
  inputClassName?: string;
  ariaLabel: string;
};

export function InlineText({
  value,
  placeholder,
  onChange,
  multiline = false,
  className,
  inputClassName,
  ariaLabel
}: InlineTextProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!editing) return;

    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  }, [editing]);

  function commit() {
    onChange(draft.trim());
    setEditing(false);
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    if (event.key === "Escape") {
      event.preventDefault();
      setDraft(value);
      setEditing(false);
    }

    if (
      event.key === "Enter" &&
      (!multiline || event.metaKey || event.ctrlKey)
    ) {
      event.preventDefault();
      commit();
    }
  }

  if (editing) {
    const sharedProps = {
      value: draft,
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setDraft(event.target.value),
      onBlur: commit,
      onKeyDown: handleKeyDown,
      "aria-label": ariaLabel,
      className: cn(
        "w-full rounded-xl border border-accent bg-panel px-3 py-2 text-foreground outline-none shadow-lg",
        inputClassName
      )
    };

    return multiline ? (
      <textarea
        ref={inputRef as RefObject<HTMLTextAreaElement>}
        rows={4}
        {...sharedProps}
      />
    ) : (
      <input ref={inputRef as RefObject<HTMLInputElement>} {...sharedProps} />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      className={cn(
        "group/edit border-accent/40 bg-accent/[0.04] ring-accent/10 relative block w-full cursor-text rounded-xl border border-dashed text-left ring-1 ring-inset transition-colors",
        "hover:bg-accent/10 hover:ring-accent/30 hover:border-accent focus-visible:border-focus-ring",
        className
      )}
      title="Click to edit"
    >
      <span className={cn(!value && "italic text-muted")}>
        {value || placeholder}
      </span>
      <span className="pointer-events-none absolute -right-2 -top-2 inline-flex items-center gap-1 rounded-full bg-accent px-2 py-1 text-[0.5rem] uppercase tracking-ui text-accent-contrast opacity-70 shadow-sm transition-opacity group-hover/edit:opacity-100">
        <Pencil className="h-2.5 w-2.5" />
        Editierbar
      </span>
    </button>
  );
}
