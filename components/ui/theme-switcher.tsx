"use client";

import {
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useRef,
  useState
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { themes, type ThemeId } from "@/lib/themes";
import { useTheme } from "@/components/ui/theme-provider";
import { cn } from "@/lib/utils";

export function ThemeSwitcher() {
  const { theme, mounted, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const currentThemeData = themes.find((t) => t.id === theme);

  useEffect(() => {
    if (!open) {
      return;
    }

    const focusFrame = window.requestAnimationFrame(() => {
      const activeIndex = Math.max(
        themes.findIndex((entry) => entry.id === theme),
        0
      );
      itemRefs.current[activeIndex]?.focus();
    });

    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, theme]);

  if (!mounted) {
    return null;
  }

  function selectTheme(id: ThemeId) {
    setTheme(id);
    setOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function handleMenuKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Tab") {
      setOpen(false);
      return;
    }

    const currentIndex = itemRefs.current.findIndex(
      (item) => item === document.activeElement
    );
    let nextIndex: number | null = null;

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % themes.length;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + themes.length) % themes.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = themes.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      itemRefs.current[nextIndex]?.focus();
    }
  }

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="theme-menu"
        aria-label={`Choose theme (current: ${currentThemeData?.label ?? "Theme"})`}
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-full",
          "border border-line shadow-card backdrop-blur-xl",
          "transition-all duration-200 hover:scale-110 active:scale-95"
        )}
        style={{ backgroundColor: "var(--panel)" }}
      >
        <span
          className="h-4 w-4 rounded-full border border-line"
          style={{ backgroundColor: currentThemeData?.accent }}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="theme-menu"
            role="menu"
            aria-label="Theme"
            onKeyDown={handleMenuKeyDown}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="fixed right-4 top-[4.5rem] z-50 mt-2 flex max-h-[calc(100dvh-5.5rem)] w-56 flex-col gap-1 overflow-y-auto rounded-2xl border border-line bg-background/95 p-2 shadow-card backdrop-blur-2xl sm:right-8 sm:top-[5.5rem] sm:max-h-[calc(100dvh-6.5rem)] lg:absolute lg:right-0 lg:top-full lg:max-h-[70vh]"
          >
            {themes.map((entry, index) => {
              const active = entry.id === theme;

              return (
                <button
                  key={entry.id}
                  ref={(node) => {
                    itemRefs.current[index] = node;
                  }}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  tabIndex={active ? 0 : -1}
                  onClick={() => selectTheme(entry.id)}
                  className={cn(
                    "flex min-h-11 items-center gap-2 rounded-xl border px-2.5 py-2 text-left text-[0.66rem] uppercase tracking-ui transition-colors duration-150",
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-line text-muted hover:border-accent hover:text-foreground"
                  )}
                >
                  <span
                    className="h-3 w-3 shrink-0 rounded-full border border-white/30"
                    style={{ backgroundColor: entry.accent }}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1 truncate">{entry.label}</span>
                  {active ? (
                    <Check className="h-3 w-3 shrink-0" aria-hidden="true" />
                  ) : null}
                </button>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
