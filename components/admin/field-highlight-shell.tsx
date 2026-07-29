import type { ReactNode } from "react";
import type { AdminProjectFieldKey } from "@/lib/admin-types";
import { cn } from "@/lib/utils";

type FieldHighlightShellProps = {
  fieldKey: AdminProjectFieldKey;
  activeField: AdminProjectFieldKey | null;
  onActiveFieldChange: (field: AdminProjectFieldKey | null) => void;
  className?: string;
  children: ReactNode;
};

function FieldHighlightShell({
  fieldKey,
  activeField,
  onActiveFieldChange,
  className,
  children,
  variant
}: FieldHighlightShellProps & { variant: "editor" | "preview" }) {
  const isHighlighted = activeField === fieldKey;

  return (
    <div
      data-admin-editor-field={variant === "editor" ? fieldKey : undefined}
      onMouseEnter={() => onActiveFieldChange(fieldKey)}
      onMouseLeave={() => onActiveFieldChange(null)}
      onFocusCapture={() => onActiveFieldChange(fieldKey)}
      onBlurCapture={(event) => {
        const nextTarget = event.relatedTarget as Node | null;
        if (!event.currentTarget.contains(nextTarget)) {
          onActiveFieldChange(null);
        }
      }}
      className={cn(
        variant === "editor"
          ? "rounded-[1.5rem] p-3 ring-1 ring-transparent transition-colors"
          : "rounded-[1.25rem] ring-1 ring-transparent transition-colors",
        isHighlighted
          ? variant === "editor"
            ? "bg-accent/5 ring-accent/40"
            : "bg-accent/5 ring-accent/50"
          : "",
        className
      )}
    >
      {children}
    </div>
  );
}

export function EditorFieldShell(props: FieldHighlightShellProps) {
  return <FieldHighlightShell {...props} variant="editor" />;
}

export function PreviewFieldShell(props: FieldHighlightShellProps) {
  return <FieldHighlightShell {...props} variant="preview" />;
}
