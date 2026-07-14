"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { Lightbox } from "@/components/ui/lightbox";
import { FallbackImage } from "@/components/ui/fallback-image";
import { Reveal } from "@/components/ui/reveal";
import type { FrameItem } from "@/lib/project-images";
import { cn } from "@/lib/utils";

type SelectedFramesProps = {
  frames: FrameItem[];
};

const fallbackFrameImages = [
  "/images/demo-car-02.jpg",
  "/images/demo-car-03.jpg",
  "/images/demo-car-04.jpg",
  "/images/demo-car-05.jpg"
];

export function SelectedFrames({ frames }: SelectedFramesProps) {
  const frameItems = frames.slice(0, 8);
  const frameImages = frameItems.map((frame) => frame.image);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (frameItems.length === 0) return null;

  const previousIndex =
    (focusedIndex - 1 + frameItems.length) % frameItems.length;
  const nextIndex = (focusedIndex + 1) % frameItems.length;

  function openFrame(index: number) {
    const href = frameItems[index]?.href;

    if (href) {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }

    setActiveIndex(index);
  }

  function closeLightbox() {
    setActiveIndex(null);
  }

  function prev() {
    setActiveIndex((i) =>
      i === null ? 0 : (i - 1 + frameImages.length) % frameImages.length
    );
  }

  function next() {
    setActiveIndex((i) => (i === null ? 0 : (i + 1) % frameImages.length));
  }

  function showPreviousFrame() {
    setFocusedIndex(previousIndex);
  }

  function showNextFrame() {
    setFocusedIndex(nextIndex);
  }

  function renderFrameButton({
    index,
    position
  }: {
    index: number;
    position: "left" | "center" | "right";
  }) {
    const frame = frameItems[index];
    const isCenter = position === "center";

    return (
      <button
        key={`${position}-${frame.image}-${index}`}
        type="button"
        aria-label={
          isCenter
            ? frame.href
              ? `Open still link ${index + 1}`
              : `Expand still ${index + 1}`
            : position === "left"
              ? "Show previous still"
              : "Show next still"
        }
        onClick={() => {
          if (isCenter) {
            openFrame(index);
            return;
          }

          setFocusedIndex(index);
        }}
        className={cn(
          "group absolute focus-visible:outline-none",
          "transition-all duration-500 ease-out",
          isCenter
            ? "left-1/2 top-0 z-30 w-[78vw] -translate-x-1/2 sm:w-[48%]"
            : "top-[30%] z-10 w-[78vw] opacity-90 sm:w-[46%]",
          position === "left" && "-left-[47vw] sm:left-0 lg:left-0",
          position === "right" && "-right-[47vw] sm:right-0 lg:right-0"
        )}
      >
        <div className="film-frame relative overflow-hidden rounded-[2rem]">
          <div className="aspect-[4/3]" />
          <FallbackImage
            src={frame.image}
            fallbackSrc={fallbackFrameImages[index % fallbackFrameImages.length]}
            alt={`Automotive still ${index + 1}`}
            fill
            sizes="(min-width: 1280px) 660px, (min-width: 640px) 48vw, 78vw"
            unoptimized
            className={cn(
              "object-cover transition-transform duration-700",
              isCenter ? "group-hover:scale-[1.03]" : "scale-[1.01]"
            )}
          />
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center",
              "transition-colors duration-300",
              isCenter
                ? "bg-black/0 group-hover:bg-black/30"
                : "bg-black/20 group-hover:bg-black/10"
            )}
          >
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full",
                "border border-white/30 bg-white/10 backdrop-blur",
                "transition-opacity duration-300",
                isCenter ? "opacity-0 group-hover:opacity-100" : "opacity-80"
              )}
            >
              {isCenter ? (
                <Expand className="h-5 w-5 text-white" />
              ) : position === "left" ? (
                <ChevronLeft className="h-5 w-5 text-white" />
              ) : (
                <ChevronRight className="h-5 w-5 text-white" />
              )}
            </div>
          </div>
        </div>
      </button>
    );
  }

  return (
    <>
      <section className="section-shell section-space-tight pt-0">
        <div className="grid gap-6 border-b border-line pb-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <Reveal className="space-y-5">
            <p className="eyebrow">Large still imagery</p>
            <h2 className="font-[family:var(--font-display)] text-4xl uppercase leading-none sm:text-6xl">
              Shot
              <span className="block pl-8 text-accent sm:pl-12">
                With Intent
              </span>
            </h2>
          </Reveal>

        </div>

        <Reveal variant="default" className="pt-8">
          <div className="relative mx-auto h-[92vw] min-h-[380px] max-w-[1360px] overflow-hidden pb-10 pt-4 sm:h-[51vw] sm:min-h-[440px] lg:max-h-[690px]">
            {frameItems.length > 1
              ? renderFrameButton({ index: previousIndex, position: "left" })
              : null}
            {renderFrameButton({ index: focusedIndex, position: "center" })}
            {frameItems.length > 1
              ? renderFrameButton({ index: nextIndex, position: "right" })
              : null}
            {frameItems.length > 1 ? (
              <div className="absolute bottom-0 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3">
                <button
                  type="button"
                  aria-label="Show previous still"
                  onClick={showPreviousFrame}
                  className="control-pill h-11 w-11 px-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="rounded-full border border-line bg-panel px-4 py-2 text-xs uppercase tracking-ui text-muted">
                  {focusedIndex + 1} / {frameItems.length}
                </span>
                <button
                  type="button"
                  aria-label="Show next still"
                  onClick={showNextFrame}
                  className="control-pill h-11 w-11 px-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </div>
        </Reveal>
      </section>

      <Lightbox
        images={frameImages}
        fallbackImages={fallbackFrameImages}
        activeIndex={activeIndex}
        onClose={closeLightbox}
        onPrev={prev}
        onNext={next}
      />
    </>
  );
}
