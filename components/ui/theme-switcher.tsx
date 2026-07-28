"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ui/theme-provider";
import { cn } from "@/lib/utils";
import { VINTAGE_DARK_THEME, VINTAGE_LIGHT_THEME } from "@/lib/themes";

export function ThemeSwitcher() {
  const { theme, mounted, setTheme } = useTheme();
  const isDark = theme === VINTAGE_DARK_THEME;

  if (!mounted) {
    return null;
  }

  const nextTheme = isDark ? VINTAGE_LIGHT_THEME : VINTAGE_DARK_THEME;
  const nextThemeLabel = isDark ? "Vintage Light" : "Vintage Dark";

  return (
    <div className="shrink-0">
      <button
        type="button"
        onClick={() => setTheme(nextTheme)}
        aria-label={`Switch to ${nextThemeLabel}`}
        title={`Switch to ${nextThemeLabel}`}
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-full",
          "border border-line shadow-card backdrop-blur-xl",
          "transition-all duration-200 hover:scale-110 active:scale-95"
        )}
        style={{ backgroundColor: "var(--panel)" }}
      >
        {isDark ? (
          <Sun className="h-4 w-4" style={{ color: "var(--foreground)" }} />
        ) : (
          <Moon className="h-4 w-4" style={{ color: "var(--foreground)" }} />
        )}
      </button>
    </div>
  );
}
