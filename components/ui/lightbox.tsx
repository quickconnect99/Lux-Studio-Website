"use client";

import { getImageProps } from "next/image";
import { useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { FallbackImage } from "@/components/ui/fallback-image";
import { useFocusTrapDialog } from "@/hooks/use-focus-trap-dialog";
import { useSwipeNavigation } from "@/hooks/use-swipe-navigation";
import { motionDuration, motionEase } from "@/lib/motion";
import { cn } from "@/lib/utils";

type LightboxProps = {
  images: string[];
  imageAlts?: string[];
  activeIndex: number | null;
  fallbackImages?: string[];
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

export function Lightbox({
  images,
  imageAlts = [],
  activeIndex,
  fallbackImages = [],
  onClose,
  onPrev,
  onNext
}: LightboxProps) {
  const isOpen = activeIndex !== null;
  const shouldReduceMotion = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const swipe = useSwipeNavigation(onPrev, onNext);
  const actionsRef = useRef({ onClose, onPrev, onNext });

  useEffect(() => {
    actionsRef.current = { onClose, onPrev, onNext };
  }, [onClose, onNext, onPrev]);

  useFocusTrapDialog({
    active: isOpen,
    containerRef: dialogRef,
    initialFocusRef: closeButtonRef,
    onClose
  });

  useEffect(() => {
    if (!isOpen) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") actionsRef.current.onPrev();
      if (e.key === "ArrowRight") actionsRef.current.onNext();
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  useEffect(() => {
    if (activeIndex === null || images.length < 2) {
      return;
    }

    const adjacentIndexes = new Set([
      (activeIndex - 1 + images.length) % images.length,
      (activeIndex + 1) % images.length
    ]);

    adjacentIndexes.forEach((index) => {
      const image = new window.Image();
      const { props } = getImageProps({
        src: images[index],
        alt: "",
        width: 1800,
        height: 1080,
        sizes:
          "(min-width: 1920px) 1650px, (min-width: 640px) calc(100vw - 12rem), calc(100vw - 1.5rem)",
        quality: 95
      });
      image.onerror = () => {
        image.onerror = null;
        image.src = images[index];
      };
      image.decoding = "async";
      image.fetchPriority = "low";
      image.sizes = props.sizes ?? "100vw";
      image.srcset = props.srcSet ?? "";
      image.src = props.src;
    });
  }, [activeIndex, images]);

  const imageNumber =
    activeIndex === null ? "00" : String(activeIndex + 1).padStart(2, "0");
  const imageTotal = String(images.length).padStart(2, "0");
  const stageImageSizes =
    "(min-width: 1920px) 1650px, (min-width: 640px) calc(100vw - 12rem), calc(100vw - 1.5rem)";

  const previousControl = (
    <button
      type="button"
      aria-label="Previous image"
      data-lightbox-control="previous"
      onClick={onPrev}
      className={cn(
        "group/navigation inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
        "border border-white/20 bg-white/[0.06] text-white shadow-[0_8px_24px_rgba(0,0,0,0.24)]",
        "transition-colors duration-150 hover:border-white/45 hover:bg-white/[0.14] focus-visible:border-accent focus-visible:bg-white/[0.14] active:!scale-100"
      )}
    >
      <ChevronLeft className="h-5 w-5 transition-transform duration-150 group-hover/navigation:-translate-x-0.5" />
    </button>
  );

  const nextControl = (
    <button
      type="button"
      aria-label="Next image"
      data-lightbox-control="next"
      onClick={onNext}
      className={cn(
        "group/navigation inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
        "border border-white/20 bg-white/[0.06] text-white shadow-[0_8px_24px_rgba(0,0,0,0.24)]",
        "transition-colors duration-150 hover:border-white/45 hover:bg-white/[0.14] focus-visible:border-accent focus-visible:bg-white/[0.14] active:!scale-100"
      )}
    >
      <ChevronRight className="h-5 w-5 transition-transform duration-150 group-hover/navigation:translate-x-0.5" />
    </button>
  );

  return (
    <AnimatePresence>
      {isOpen && activeIndex !== null && (
        <m.div
          ref={dialogRef}
          key="lightbox-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: motionDuration.state }}
          className="lightbox-safe-area fixed inset-0 z-[100] grid grid-rows-[auto_minmax(0,1fr)] gap-3 bg-black/95 p-3 sm:gap-4 sm:p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
          tabIndex={-1}
        >
          <header
            className="mx-auto flex w-full max-w-[112.5rem] items-center justify-between gap-4 text-white"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-[0.62rem] uppercase tracking-meta text-white/65">
              Project still{" "}
              <span
                aria-live="polite"
                aria-atomic="true"
                className="font-[family-name:var(--font-mono)] text-white"
              >
                {imageNumber} / {imageTotal}
              </span>
            </p>

            <div className="flex items-center gap-3">
              {images.length > 1 ? (
                <span className="hidden text-[0.6rem] uppercase tracking-ui text-white/45 sm:inline">
                  Use arrow keys to browse
                </span>
              ) : null}
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Close lightbox"
                onClick={onClose}
                className={cn(
                  "inline-flex h-11 w-11 items-center justify-center rounded-full",
                  "border border-white/20 bg-white/[0.06] text-white",
                  "transition-colors duration-150 hover:border-white/45 hover:bg-white/[0.14] focus-visible:border-accent focus-visible:bg-white/[0.14]"
                )}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div
            data-lightbox-shell
            className={cn(
              "mx-auto grid min-h-0 w-full max-w-[112.5rem] grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] grid-rows-[minmax(0,1fr)_2.75rem] items-center gap-3",
              images.length > 1 && "sm:grid-rows-1 sm:gap-4"
            )}
            onClick={(event) => event.stopPropagation()}
          >
            {images.length > 1 ? (
              <div className="col-start-1 row-start-2 sm:row-start-1">
                {previousControl}
              </div>
            ) : null}

            <div
              data-lightbox-frame
              className={cn(
                "relative col-span-3 row-start-1 flex h-full min-h-0 w-full touch-pan-y items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-black/30",
                images.length > 1 && "sm:col-span-1 sm:col-start-2"
              )}
              {...swipe}
            >
              <AnimatePresence initial={false} mode="sync">
                <m.div
                  key={activeIndex}
                  initial={
                    shouldReduceMotion ? false : { opacity: 0, scale: 1.006 }
                  }
                  animate={{ opacity: 1, scale: 1 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : motionDuration.state,
                    ease: motionEase
                  }}
                  className="absolute inset-0"
                  style={{ willChange: "opacity, transform" }}
                >
                  <FallbackImage
                    src={images[activeIndex]}
                    fallbackSrc={
                      (fallbackImages.length > 0
                        ? fallbackImages[activeIndex % fallbackImages.length]
                        : undefined) ?? images[activeIndex]
                    }
                    alt={
                      imageAlts[activeIndex] ??
                      `Enlarged project still ${activeIndex + 1}`
                    }
                    fill
                    sizes={stageImageSizes}
                    className="object-contain"
                    quality={95}
                    loading="eager"
                  />
                </m.div>
              </AnimatePresence>
            </div>

            {images.length > 1 ? (
              <div className="col-start-3 row-start-2 flex justify-end sm:row-start-1">
                {nextControl}
              </div>
            ) : null}
            {images.length > 1 ? (
              <p className="col-start-2 row-start-2 text-center text-xs text-white/75 sm:hidden">
                Swipe to browse
              </p>
            ) : null}
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
