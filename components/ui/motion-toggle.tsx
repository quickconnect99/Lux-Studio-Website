"use client";

import { useMotionPreference } from "@/components/ui/motion-preference-provider";
import { cn } from "@/lib/utils";

export function MotionToggle() {
  const { enabled, mounted, setEnabled } = useMotionPreference();

  if (!mounted) {
    return (
      <div
        aria-hidden="true"
        className="h-11 w-[5.25rem] shrink-0 rounded-full border border-transparent"
      />
    );
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={
        enabled ? "Turn cinematic motion off" : "Turn cinematic motion on"
      }
      title={enabled ? "Motion: On" : "Motion: Off"}
      onClick={() => setEnabled(!enabled)}
      className="control-pill shrink-0 gap-2 active:!scale-100"
    >
      <span className="text-[0.62rem] tracking-[0.16em]">Motion</span>
      <span
        aria-hidden="true"
        className={cn(
          "relative inline-flex h-4 w-8 shrink-0 items-center rounded-full transition-colors duration-200",
          enabled ? "bg-accent" : "bg-line"
        )}
      >
        <span
          className={cn(
            "inline-block h-3 w-3 translate-x-0.5 transform rounded-full bg-background shadow-sm transition-transform duration-200",
            enabled && "translate-x-4"
          )}
        />
      </span>
    </button>
  );
}
