"use client";

import { ResilientImage as Image } from "@/components/ui/resilient-image";
import dynamic from "next/dynamic";
import { useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { motionDuration, motionEase } from "@/lib/motion";
import { cn } from "@/lib/utils";

const Lightbox = dynamic(
  () => import("@/components/ui/lightbox").then((module) => module.Lightbox),
  { ssr: false }
);

type ProjectImageCarouselProps = {
  images: string[];
  captions?: string[];
  alts?: Array<string | undefined>;
  title: string;
};

export function ProjectImageCarousel({
  images,
  captions = [],
  alts = [],
  title
}: ProjectImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const [hasOpenedLightbox, setHasOpenedLightbox] = useState(false);

  if (images.length === 0) return null;

  const activeImage = images[activeIndex];
  const activeCaption = captions[activeIndex]?.trim();
  // An independently maintained alt text wins; otherwise fall back to a
  // caption-derived description so images never ship with empty alt text.
  const imageAlts = images.map((_, index) => {
    const explicitAlt = alts[index]?.trim();
    if (explicitAlt) return explicitAlt;

    return captions[index]?.trim()
      ? `${title}: ${captions[index].trim()}`
      : `${title} project still ${index + 1}`;
  });

  function prev() {
    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  }

  function next() {
    setActiveIndex((current) => (current + 1) % images.length);
  }

  function openFullscreen() {
    setHasOpenedLightbox(true);
    setFullscreenIndex(activeIndex);
  }

  function showFullscreenImage(index: number) {
    setHasOpenedLightbox(true);
    setActiveIndex(index);
    setFullscreenIndex(index);
  }

  return (
    <>
      <div
        data-project-carousel
        className="overflow-hidden rounded-[1.5rem] border border-line bg-panel-secondary p-3 shadow-card sm:rounded-[2rem] sm:p-5"
      >
        <div className="space-y-3">
          <div className="film-frame relative overflow-hidden rounded-[1.25rem] sm:rounded-[1.5rem]">
            <div className="aspect-[4/3] sm:aspect-[16/9]" />
            <AnimatePresence initial={false} mode="sync">
              <m.div
                key={activeImage}
                initial={{ opacity: 0, scale: 1.015 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.985 }}
                transition={{
                  duration: motionDuration.state,
                  ease: motionEase
                }}
                className="absolute inset-0"
              >
                <Image
                  src={activeImage}
                  fallbackSrc="/images/hero-poster.svg"
                  alt={imageAlts[activeIndex]}
                  fill
                  sizes="(min-width: 1440px) 1360px, 100vw"
                  className="object-cover"
                />
              </m.div>
            </AnimatePresence>

            <button
              type="button"
              data-project-carousel-open
              onClick={openFullscreen}
              aria-label={`Open ${title} image ${activeIndex + 1} in fullscreen`}
              className="absolute inset-0 z-10 cursor-zoom-in focus-visible:bg-white/5 active:!scale-100"
            />

            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/65 via-black/20 to-transparent p-4 text-white sm:p-6">
              <p className="text-[0.62rem] uppercase tracking-meta text-white/75">
                Project stills
              </p>
              <span
                aria-live="polite"
                aria-atomic="true"
                className="font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-meta text-white/75"
              >
                {String(activeIndex + 1).padStart(2, "0")} /{" "}
                {String(images.length).padStart(2, "0")}
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between bg-gradient-to-t from-black/70 via-black/15 to-transparent p-4 sm:p-6">
              <p className="max-w-[60%] truncate text-xs uppercase tracking-ui text-white/70">
                {title}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openFullscreen}
                  aria-label="Open current project image in fullscreen"
                  className={cn(
                    "inline-flex h-11 w-11 items-center justify-center rounded-full",
                    "border border-white/25 bg-black/25 text-white backdrop-blur-md",
                    "transition-colors duration-150 hover:border-accent hover:bg-black/45"
                  )}
                >
                  <Maximize2 className="h-4 w-4" />
                </button>

                {images.length > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={prev}
                      aria-label="Previous image"
                      className={cn(
                        "inline-flex h-11 w-11 items-center justify-center rounded-full",
                        "border border-white/25 bg-black/25 text-white backdrop-blur-md",
                        "transition-colors duration-150 hover:border-accent hover:bg-black/45"
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
                        "border border-white/25 bg-black/25 text-white backdrop-blur-md",
                        "transition-colors duration-150 hover:border-accent hover:bg-black/45"
                      )}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          {images.length > 1 ? (
            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-4 sm:gap-3 lg:grid-cols-6">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Show image ${index + 1}`}
                  aria-current={activeIndex === index ? "true" : undefined}
                  className={cn(
                    "relative w-28 shrink-0 overflow-hidden rounded-[1rem] border transition-[border-color,box-shadow,opacity] duration-150 sm:w-auto sm:rounded-[1.1rem]",
                    activeIndex === index
                      ? "ring-accent/25 border-accent ring-2"
                      : "hover:border-foreground/35 border-line opacity-70 hover:opacity-100"
                  )}
                >
                  <div className="aspect-[4/3]" />
                  <Image
                    src={image}
                    fallbackSrc="/images/hero-poster.svg"
                    alt={`${title} thumbnail ${index + 1}`}
                    fill
                    sizes="(min-width: 1024px) 15vw, 112px"
                    className="object-cover"
                  />
                  <span className="absolute bottom-1.5 right-1.5 rounded-full bg-black/55 px-2 py-1 font-[family-name:var(--font-mono)] text-[0.55rem] text-white/80 backdrop-blur">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          {activeCaption ? (
            <p
              aria-live="polite"
              className="description-copy-compact rounded-[1rem] border border-line bg-panel px-4 py-3 text-muted"
            >
              {activeCaption}
            </p>
          ) : null}
        </div>
      </div>

      {hasOpenedLightbox ? (
        <Lightbox
          images={images}
          imageAlts={imageAlts}
          fallbackImages={["/images/hero-poster.svg"]}
          activeIndex={fullscreenIndex}
          onClose={() => setFullscreenIndex(null)}
          onPrev={() =>
            showFullscreenImage(
              ((fullscreenIndex ?? activeIndex) - 1 + images.length) %
                images.length
            )
          }
          onNext={() =>
            showFullscreenImage(
              ((fullscreenIndex ?? activeIndex) + 1) % images.length
            )
          }
        />
      ) : null}
    </>
  );
}
