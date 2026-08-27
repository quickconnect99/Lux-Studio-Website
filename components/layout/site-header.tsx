"use client";

import Link from "next/link";
import { AdaptiveImage as Image } from "@/components/ui/adaptive-image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { AnimatePresence, m } from "framer-motion";
import { useRef, useState } from "react";
import { useFocusTrapDialog } from "@/hooks/use-focus-trap-dialog";
import type { SiteSettings } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getVisibleNavigation } from "@/lib/site-config";
import { motionDuration, motionEase } from "@/lib/motion";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";

type SiteHeaderProps = {
  settings: SiteSettings;
};

export function SiteHeader({ settings }: SiteHeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const navigation = getVisibleNavigation(settings.navigation);

  useFocusTrapDialog({
    active: open,
    containerRef: mobileMenuRef,
    initialFocusSelector: "a[href]",
    onClose: () => setOpen(false)
  });

  return (
    <header className="safe-area-top sticky top-0 z-50 border-b border-line bg-[var(--header-bg)]">
      <div className="backdrop-blur-xl">
        <div className="section-shell flex min-h-[4.5rem] items-center justify-between gap-4 py-2.5 sm:min-h-[5.5rem] sm:gap-6 sm:py-4">
          {/* Brand / logo lockup */}
          <Link
            href="/"
            className="group flex min-w-0 items-center gap-3 sm:gap-4"
          >
            <div
              className={cn(
                "relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[1rem]",
                "border border-line bg-panel shadow-sm sm:h-16 sm:w-16",
                "transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:group-hover:scale-100"
              )}
            >
              <Image
                data-company-logo
                src="/images/brand/lux-studio-logo.svg"
                alt=""
                width={64}
                height={64}
                priority
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[0.68rem] uppercase tracking-ui text-muted transition-colors duration-200 group-hover:text-foreground sm:text-xs">
                {settings.brand.name}
              </p>
              <p className="hidden text-xs text-muted sm:block">
                {settings.brand.strapline || "Campaign motion studio"}
              </p>
            </div>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-6 lg:flex">
            {navigation.map((item, index) => {
              const active =
                item.href === "/"
                  ? pathname === item.href
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group inline-flex items-center gap-3 text-sm font-medium uppercase tracking-[0.2em] text-muted",
                    active && "text-foreground"
                  )}
                >
                  <span className="metadata-number">0{index + 1}</span>
                  <span className="relative">
                    {item.label}
                    <span
                      className={cn(
                        "absolute -bottom-2 left-0 h-px bg-accent transition-[width] duration-300",
                        active ? "w-full" : "w-0 group-hover:w-full"
                      )}
                    />
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            {/* Mobile menu toggle */}
            <button
              type="button"
              aria-expanded={open}
              aria-controls="mobile-navigation"
              aria-label={open ? "Close navigation" : "Open navigation"}
              onClick={() => setOpen((value) => !value)}
              className={cn(
                "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                "border border-line bg-panel text-foreground lg:hidden",
                "transition-colors duration-200 hover:border-accent hover:bg-panel-secondary"
              )}
            >
              <AnimatePresence mode="wait" initial={false}>
                {open ? (
                  <m.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: motionDuration.micro }}
                  >
                    <X className="h-4 w-4" />
                  </m.span>
                ) : (
                  <m.span
                    key="open"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: motionDuration.micro }}
                  >
                    <Menu className="h-4 w-4" />
                  </m.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation – animated slide-in */}
      <AnimatePresence>
        {open && (
          <m.div
            key="mobile-nav"
            id="mobile-navigation"
            ref={mobileMenuRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-navigation-title"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{
              duration: motionDuration.state,
              ease: motionEase
            }}
            className="mobile-navigation-panel bg-background/95 fixed inset-x-0 bottom-0 overflow-y-auto border-t border-line shadow-card backdrop-blur-2xl lg:hidden"
          >
            <div className="section-shell flex min-h-full flex-col pb-5 pt-4">
              <div className="mb-4 flex items-center justify-between gap-4">
                <p id="mobile-navigation-title" className="eyebrow">
                  Navigation
                </p>
                <button
                  type="button"
                  data-mobile-navigation-close
                  onClick={() => setOpen(false)}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-panel text-foreground transition-colors hover:border-accent hover:bg-panel-secondary"
                  aria-label="Close navigation"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {navigation.map((item, index) => {
                  const active =
                    item.href === "/"
                      ? pathname === item.href
                      : pathname === item.href ||
                        pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-16 items-center justify-between rounded-[1.25rem] border px-5 py-4",
                        "font-[family-name:var(--font-display)] text-2xl font-medium uppercase leading-none tracking-[0.04em]",
                        "transition-colors duration-150",
                        active
                          ? "border-foreground bg-foreground text-background"
                          : "border-line bg-panel text-foreground hover:border-accent"
                      )}
                      onClick={() => setOpen(false)}
                    >
                      <span>{item.label}</span>
                      <span
                        className={cn(
                          "font-[family-name:var(--font-mono)] text-[0.68rem]",
                          active ? "text-accent-text" : "text-muted"
                        )}
                      >
                        0{index + 1}
                      </span>
                    </Link>
                  );
                })}
              </div>
              <div className="mt-auto border-t border-line pt-6">
                <p className="max-w-sm text-sm leading-7 text-muted">
                  {settings.brand.strapline}
                </p>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  );
}
