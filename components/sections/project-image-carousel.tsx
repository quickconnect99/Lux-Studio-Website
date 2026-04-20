"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ProjectImageCarouselProps = {
  images: string[];
  title: string;
};

export function ProjectImageCarousel({
  images,
  title
}: ProjectImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) return null;

  const activeImage = images[activeIndex];

  function prev() {
    setActiveIndex((current) =>
      (current - 1 + images.length) % images.length
    );
  }

  function next() {
    setActiveIndex((current) => (current + 1) % images.length);
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-line bg-panel-secondary shadow-card p-4 sm:p-5">
      <div className="grid gap-5 lg:grid-cols-[0.84fr_1.16fr] lg:items-center">
        <div className="space-y-4 rounded-[1.5rem] border border-line bg-panel p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="metadata-number">Image Cluster</p>
            <span className="text-[0.62rem] uppercase tracking-meta text-muted">
              {String(activeIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
            </span>
          </div>

          <h2 className="font-[family:var(--font-display)] text-3xl uppercase leading-none text-foreground sm:text-4xl">
            Supporting
            <span className="block pl-6 text-accent sm:pl-10">
              Frames
            </span>
          </h2>

          <p className="text-sm leading-7 text-muted">
            Use the arrow controls to move through the supporting project stills
            without mixing them into the Frame cards below.
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous image"
              className={cn(
                "inline-flex h-11 w-11 items-center justify-center rounded-full",
                "border border-line bg-panel-secondary text-foreground",
                "transition-colors duration-150 hover:border-accent hover:bg-panel"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              className={cn(
                "inline-flex h-11 w-11 items-center justify-center rounded-full",
                "border border-line bg-panel-secondary text-foreground",
                "transition-colors duration-150 hover:border-accent hover:bg-panel"
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="film-frame relative overflow-hidden rounded-[1.5rem]">
            <div className="aspect-[16/10]" />
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImage}
                initial={{ opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -28 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src={activeImage}
                  alt={`${title} carousel image ${activeIndex + 1}`}
                  fill
                  sizes="(min-width: 1024px) 38vw, 100vw"
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {images.length > 1 ? (
            <div className="grid grid-cols-3 gap-3">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Show image ${index + 1}`}
                  className={cn(
                    "relative overflow-hidden rounded-[1.1rem] border transition-colors duration-150",
                    activeIndex === index
                      ? "border-accent"
                      : "border-line hover:border-foreground/35"
                  )}
                >
                  <div className="aspect-[1.08/1]" />
                  <Image
                    src={image}
                    alt={`${title} thumbnail ${index + 1}`}
                    fill
                    sizes="(min-width: 1024px) 12vw, 30vw"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
