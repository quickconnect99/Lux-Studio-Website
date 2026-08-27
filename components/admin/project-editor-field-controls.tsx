"use client";

import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CircleHelp } from "lucide-react";
import { adminProjectFieldMeta } from "@/lib/admin-project-fields";
import type { AdminProjectFieldKey } from "@/lib/admin-types";
import { cn } from "@/lib/utils";

function FieldHelpTooltip({ fieldKey }: { fieldKey: AdminProjectFieldKey }) {
  const meta = adminProjectFieldMeta[fieldKey];
  const tooltipId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{
    left: number;
    top: number;
    width: number;
  } | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function updatePosition() {
      const button = buttonRef.current;
      const tooltip = tooltipRef.current;

      if (!button || !tooltip) {
        return;
      }

      const gutter = 16;
      const gap = 8;
      const buttonRect = button.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const width = Math.min(288, window.innerWidth - gutter * 2);
      const left = Math.min(
        Math.max(buttonRect.left, gutter),
        window.innerWidth - width - gutter
      );
      const below = buttonRect.bottom + gap;
      const top =
        below + tooltipRect.height <= window.innerHeight - gutter
          ? below
          : Math.max(gutter, buttonRect.top - tooltipRect.height - gap);

      setPosition({ left, top, width });
    }

    const frame = window.requestAnimationFrame(updatePosition);

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("keydown", handleEscape);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        ref={buttonRef}
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted hover:bg-panel hover:text-foreground"
        aria-label={`Where is ${meta.label} shown?`}
        aria-describedby={open ? tooltipId : undefined}
        onClick={() => setOpen(true)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <CircleHelp className="h-4 w-4" />
      </button>
      {open && typeof document !== "undefined"
        ? createPortal(
            <span
              ref={tooltipRef}
              id={tooltipId}
              role="tooltip"
              style={
                position
                  ? {
                      left: position.left,
                      top: position.top,
                      width: position.width
                    }
                  : undefined
              }
              className={cn(
                "bg-background/95 pointer-events-none fixed z-[100] rounded-[1rem] border border-line px-3 py-2 text-[0.7rem] normal-case tracking-normal text-muted shadow-card backdrop-blur-xl",
                position ? "opacity-100" : "opacity-0"
              )}
            >
              {meta.helpText}
            </span>,
            document.body
          )
        : null}
    </span>
  );
}

export function FieldLabel({
  fieldKey,
  required = false,
  children
}: {
  fieldKey: AdminProjectFieldKey;
  required?: boolean;
  children?: ReactNode;
}) {
  return (
    <span className="flex items-center gap-1.5 text-xs uppercase tracking-eyebrow">
      <span>
        {children ?? adminProjectFieldMeta[fieldKey].label}
        {required ? <span className="text-error-text"> *</span> : null}
      </span>
      <FieldHelpTooltip fieldKey={fieldKey} />
    </span>
  );
}
