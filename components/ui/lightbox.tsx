"use client";

import { getImageProps } from "next/image";
import {
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent
} from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, m } from "framer-motion";
import { FallbackImage } from "@/components/ui/fallback-image";
import { useFocusTrapDialog } from "@/hooks/use-focus-trap-dialog";
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
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const pointerOriginX = useRef<number | null>(null);
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
        quality: 95
      });
      image.src = props.src;
    });
  }, [activeIndex, images]);

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse") {
      return;
    }

    pointerOriginX.current = event.clientX;
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (pointerOriginX.current === null || event.pointerType === "mouse") {
      return;
    }

    const distance = event.clientX - pointerOriginX.current;
    pointerOriginX.current = null;

    if (Math.abs(distance) < 48) {
      return;
    }

    if (distance > 0) {
      onPrev();
    } else {
      onNext();
    }
  }

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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-2 backdrop-blur-sm sm:p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
          tabIndex={-1}
        >
          {/* Image */}
          <AnimatePresence initial={false} mode="sync">
            <m.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.985 }}
              transition={{
                duration: motionDuration.state,
                ease: motionEase
              }}
              className="relative w-full max-w-[112.5rem]"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerCancel={() => {
                pointerOriginX.current = null;
              }}
            >
              <div
                data-lightbox-frame
                className="film-frame relative h-[calc(100dvh-1rem)] max-h-[1080px] w-full overflow-hidden bg-black sm:h-[calc(100dvh-2rem)]"
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
                  sizes="(min-width: 1920px) 1800px, calc(100vw - 2rem)"
                  className="object-contain"
                  quality={95}
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
                <p
                  aria-live="polite"
                  aria-atomic="true"
                  className="absolute bottom-3 left-1/2 z-30 -translate-x-1/2 rounded-full border border-white/15 bg-black/55 px-4 py-2 text-center text-xs uppercase tracking-meta text-white/70 backdrop-blur sm:bottom-4"
                >
                  {activeIndex + 1} / {images.length}
                </p>
              </div>
            </m.div>
          </AnimatePresence>

          {/* Close */}
          <button
            ref={closeButtonRef}
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
              "transition-colors duration-150 hover:border-accent hover:bg-white/20"
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </m.div>
      )}
    </AnimatePresence>
  );
}
