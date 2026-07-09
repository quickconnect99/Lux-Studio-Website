"use client";

import { Sun, Moon } from "lucide-react";
import { themes } from "@/lib/themes";
import { useTheme } from "@/components/ui/theme-provider";
import { cn } from "@/lib/utils";

export function ThemeSwitcher() {
  const { theme, mounted, setTheme } = useTheme();
  const currentThemeData = themes.find((t) => t.id === theme);

  if (!mounted) {
    return null;
  }

  return (
    <div className="shrink-0">
      <button
        type="button"
        onClick={() =>
          setTheme(currentThemeData?.dark ? "vintage-light" : "vintage")
        }
        aria-label="Toggle day/night theme"
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-full",
          "border border-line shadow-card backdrop-blur-xl",
          "transition-all duration-200 hover:scale-110 active:scale-95"
        )}
        style={{ backgroundColor: "var(--panel)" }}
      >
        {currentThemeData?.dark ? (
          <Sun className="h-4 w-4" style={{ color: "var(--foreground)" }} />
        ) : (
          <Moon className="h-4 w-4" style={{ color: "var(--foreground)" }} />
        )}
      </button>
    </div>
  );
}
