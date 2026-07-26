"use client";

import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { FallbackImage } from "@/components/ui/fallback-image";
import { cn } from "@/lib/utils";

type LightboxProps = {
  images: string[];
  activeIndex: number | null;
  fallbackImages?: string[];
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

export function Lightbox({
  images,
  activeIndex,
  fallbackImages = [],
  onClose,
  onPrev,
  onNext
}: LightboxProps) {
  const isOpen = activeIndex !== null;

  /* Close on Escape, navigate with arrow keys */
  useEffect(() => {
    if (!isOpen) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    }

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, onPrev, onNext]);

  return (
    <AnimatePresence>
      {isOpen && activeIndex !== null && (
        <motion.div
          key="lightbox-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-2 backdrop-blur-sm sm:p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          {/* Image */}
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[112.5rem]"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              data-lightbox-frame
              className="film-frame relative aspect-[4/3] max-h-[calc(100dvh-1rem)] overflow-hidden bg-black sm:aspect-[16/9] sm:max-h-[calc(100dvh-2rem)]"
            >
              <FallbackImage
                src={images[activeIndex]}
                fallbackSrc={
                  fallbackImages[activeIndex % fallbackImages.length] ??
                  images[activeIndex]
                }
                alt={`Enlarged still ${activeIndex + 1}`}
                fill
                sizes="(min-width: 1920px) 1800px, calc(100vw - 2rem)"
                className="object-cover"
                quality={95}
                unoptimized
                priority
              />

              {images.length > 1 ? (
                <>
                  <button
                    type="button"
                    aria-label="Previous image"
                    data-lightbox-control="previous"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPrev();
                    }}
                    className={cn(
                      "group/navigation absolute -inset-y-px left-0 z-20",
                      "flex w-[15%] min-w-14 max-w-32 items-center justify-center",
                      "border-r border-white/20 bg-black/35 text-white backdrop-blur-[2px]",
                      "transition-colors duration-200 hover:bg-black/60 focus-visible:bg-black/60 active:!scale-100"
                    )}
                  >
                    <ChevronLeft className="h-7 w-7 transition-transform duration-200 group-hover/navigation:-translate-x-1" />
                  </button>

                  <button
                    type="button"
                    aria-label="Next image"
                    data-lightbox-control="next"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNext();
                    }}
                    className={cn(
                      "group/navigation absolute -inset-y-px right-0 z-20",
                      "flex w-[15%] min-w-14 max-w-32 items-center justify-center",
                      "border-l border-white/20 bg-black/35 text-white backdrop-blur-[2px]",
                      "transition-colors duration-200 hover:bg-black/60 focus-visible:bg-black/60 active:!scale-100"
                    )}
                  >
                    <ChevronRight className="h-7 w-7 transition-transform duration-200 group-hover/navigation:translate-x-1" />
                  </button>
                </>
              ) : null}

              {/* Counter */}
              <p className="absolute bottom-3 left-1/2 z-30 -translate-x-1/2 rounded-full border border-white/15 bg-black/55 px-4 py-2 text-center text-xs uppercase tracking-meta text-white/70 backdrop-blur sm:bottom-4">
                {activeIndex + 1} / {images.length}
              </p>
            </div>
          </motion.div>

          {/* Close */}
          <button
            type="button"
            aria-label="Close lightbox"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className={cn(
              "absolute right-4 top-4 z-40 sm:right-6 sm:top-6",
              "flex h-11 w-11 items-center justify-center rounded-full",
              "border border-white/25 bg-black/55 text-white backdrop-blur",
              "transition-all duration-150 hover:border-accent hover:bg-white/20"
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
