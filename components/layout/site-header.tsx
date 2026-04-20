"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { SiteSettings } from "@/lib/types";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

type SiteHeaderProps = {
  settings: SiteSettings;
};

const brandLogoSrc = "/images/brand/lux-studio-logo.svg";

export function SiteHeader({ settings }: SiteHeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusable = mobileMenuRef.current?.querySelectorAll<HTMLElement>(
      "a[href], button:not([disabled])"
    );

    focusable?.[0]?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (event.key !== "Tab" || !focusable || focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }

      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-[var(--header-bg)] backdrop-blur-xl">
      <div className="section-shell flex items-center justify-between gap-6 py-4">
        {/* Brand / logo lockup */}
        <Link href="/" className="group flex items-center gap-4">
          <div
            className={cn(
              "relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-[1.25rem]",
              "border border-line bg-panel shadow-sm sm:h-16 sm:w-16",
              "transition-transform duration-300 ease-out group-hover:scale-105"
            )}
          >
            <Image
              src={brandLogoSrc}
              alt={`${settings.brand.name} logo`}
              fill
              priority
              sizes="(max-width: 640px) 56px, 64px"
              className="object-contain p-1.5"
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-ui text-muted transition-colors duration-200 group-hover:text-foreground">
              {settings.brand.name}
            </p>
            <p className="hidden text-xs text-muted sm:block">
              {settings.brand.strapline || "Campaign motion studio"}
            </p>
          </div>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-6 lg:flex">
          {siteConfig.navigation.map((item, index) => {
            const active =
              item.href === "/"
                ? pathname === item.href
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
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
                      "absolute -bottom-2 left-0 h-px bg-accent transition-all duration-300",
                      active ? "w-full" : "w-0 group-hover:w-full"
                    )}
                  />
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile menu toggle */}
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? "Close navigation" : "Open navigation"}
          onClick={() => setOpen((value) => !value)}
          className={cn(
            "inline-flex h-11 w-11 items-center justify-center rounded-full",
            "border border-line bg-panel text-foreground lg:hidden",
            "transition-all duration-200 hover:border-accent hover:bg-panel-secondary"
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.span
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <X className="h-4 w-4" />
              </motion.span>
            ) : (
              <motion.span
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <Menu className="h-4 w-4" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Mobile navigation – animated slide-in */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-nav"
            id="mobile-navigation"
            ref={mobileMenuRef}
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="border-t border-line bg-[var(--header-bg)] shadow-card lg:hidden"
          >
            <div className="section-shell flex flex-col gap-3 py-4">
              {siteConfig.navigation.map((item, index) => {
                const active =
                  item.href === "/"
                    ? pathname === item.href
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between rounded-2xl border px-4 py-3",
                      "text-[0.95rem] font-medium tracking-[0.14em]",
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
                        "font-[family:var(--font-mono)] text-[0.68rem]",
                        active ? "text-accent" : "text-muted"
                      )}
                    >
                      0{index + 1}
                    </span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
