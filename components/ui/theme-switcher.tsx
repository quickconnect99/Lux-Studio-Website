"use client";

import { useEffect, useRef, useState } from "react";
import { Palette } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { themes } from "@/lib/themes";
import { useTheme } from "@/components/ui/theme-provider";
import { cn } from "@/lib/utils";

export function ThemeSwitcher() {
  const { theme, mounted, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close panel on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  // Close panel on Escape
  useEffect(() => {
    if (!open) return;
    function handle(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [open]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="fixed bottom-6 right-6 z-[200] flex flex-col items-end gap-2"
    >
      {/* Theme panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.94 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="glass-panel w-[13.5rem] rounded-[1.5rem] p-3"
          >
            <p className="eyebrow mb-3 px-1">Theme</p>

            <div className="grid grid-cols-2 gap-1.5">
              {themes.map((t) => {
                const isActive = theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTheme(t.id);
                      setOpen(false);
                    }}
                    aria-label={`${t.label} theme`}
                    aria-pressed={isActive}
                    className={cn(
                      "relative flex flex-col items-start gap-2 rounded-xl p-2.5 text-left",
                      "border-2 transition-all duration-150",
                      isActive
                        ? "border-accent scale-[0.97]"
                        : "border-transparent hover:border-line"
                    )}
                    style={{ backgroundColor: t.bg }}
                  >
                    {/* Accent colour preview */}
                    <div className="flex items-center gap-1">
                      <span
                        className="h-3.5 w-3.5 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: t.accent }}
                      />
                      {t.secondaryAccent ? (
                        <span
                          className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                          style={{
                            backgroundColor: t.secondaryAccent,
                            boxShadow: "0 0 0 1px rgba(27, 35, 43, 0.12)",
                          }}
                        />
                      ) : null}
                    </div>

                    {/* Theme label */}
                    <span
                      className="text-[0.58rem] font-semibold uppercase tracking-ui leading-none"
                      style={{
                        color: t.dark
                          ? "rgba(240,238,235,0.78)"
                          : "rgba(27,35,43,0.68)",
                      }}
                    >
                      {t.label}
                    </span>

                    {/* Active checkmark */}
                    {isActive && (
                      <span
                        className="absolute right-1.5 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full"
                        style={{ backgroundColor: t.accent }}
                      >
                        <svg
                          width="7"
                          height="5"
                          viewBox="0 0 7 5"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M1 2.5L2.8 4.2L6 1"
                            stroke={t.accentContrast}
                            strokeWidth="1.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button – uses current accent colour as background */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Toggle theme switcher"
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-full",
          "border border-line shadow-card backdrop-blur-xl",
          "transition-all duration-200 hover:scale-110 active:scale-95"
        )}
        style={{ backgroundColor: "var(--accent)" }}
      >
        <Palette
          className="h-4 w-4"
          style={{ color: "var(--accent-contrast)" }}
        />
      </button>
    </div>
  );
}
