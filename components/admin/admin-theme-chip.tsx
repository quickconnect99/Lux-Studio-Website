"use client";

import { themes } from "@/lib/themes";
import { useTheme } from "@/components/ui/theme-provider";

export function AdminThemeChip() {
  const { theme, mounted } = useTheme();

  if (!mounted) {
    return null;
  }

  const activeTheme = themes.find((entry) => entry.id === theme);

  if (!activeTheme) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-line bg-panel-secondary/80 px-3 py-2 text-[0.62rem] uppercase tracking-eyebrow text-muted shadow-card backdrop-blur-md">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: activeTheme.accent }}
      />
      <span>Theme</span>
      <span className="text-foreground">{activeTheme.label}</span>
    </div>
  );
}
