"use client";

import Image from "next/image";
import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

type LightboxProps = {
  images: string[];
  activeIndex: number | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

export function Lightbox({
  images,
  activeIndex,
  onClose,
  onPrev,
  onNext
}: LightboxProps) {
  const isOpen = activeIndex !== null;

  /* Close on Escape, navigate with arrow keys */
  useEffect(() => {
    if (!isOpen) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape")     onClose();
      if (e.key === "ArrowLeft")  onPrev();
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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
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
            className="relative max-h-[85vh] w-full max-w-5xl px-16"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="film-frame relative aspect-[4/3] overflow-hidden sm:aspect-[16/9]">
              <Image
                src={images[activeIndex]}
                alt={`Enlarged still ${activeIndex + 1}`}
                fill
                sizes="(min-width: 1280px) 80vw, 100vw"
                className="object-cover"
                priority
              />
            </div>

            {/* Counter */}
            <p className="mt-3 text-center text-xs uppercase tracking-meta text-white/50">
              {activeIndex + 1} / {images.length}
            </p>
          </motion.div>

          {/* Controls */}
          <button
            type="button"
            aria-label="Previous image"
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2",
              "flex h-11 w-11 items-center justify-center rounded-full",
              "border border-white/20 bg-white/10 text-white backdrop-blur",
              "transition-all duration-150 hover:border-accent hover:bg-white/20"
            )}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            aria-label="Next image"
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2",
              "flex h-11 w-11 items-center justify-center rounded-full",
              "border border-white/20 bg-white/10 text-white backdrop-blur",
              "transition-all duration-150 hover:border-accent hover:bg-white/20"
            )}
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Close */}
          <button
            type="button"
            aria-label="Close lightbox"
            onClick={onClose}
            className={cn(
              "absolute right-4 top-4",
              "flex h-11 w-11 items-center justify-center rounded-full",
              "border border-white/20 bg-white/10 text-white backdrop-blur",
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
