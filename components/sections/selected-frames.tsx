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

  function renderSideFrameButton({
    index,
    position
  }: {
    index: number;
    position: "left" | "right";
  }) {
    const frame = frameItems[index];

    return (
      <button
        key={`${position}-${frame.image}-${index}`}
        type="button"
        aria-label={
          position === "left"
            ? "Select previous still preview"
            : "Select next still preview"
        }
        onClick={() => setFocusedIndex(index)}
        className={cn(
          "group absolute top-[30%] z-10 w-[78vw] opacity-90 focus-visible:outline-none sm:w-[46%]",
          "transition-all duration-500 ease-out",
          position === "left" && "-left-[47vw] sm:left-0 lg:left-0",
          position === "right" && "-right-[47vw] sm:right-0 lg:right-0"
        )}
      >
        <div className="film-frame relative overflow-hidden rounded-[2rem]">
          <div className="aspect-[4/3]" />
          <FallbackImage
            src={frame.image}
            fallbackSrc={
              fallbackFrameImages[index % fallbackFrameImages.length]
            }
            alt={`Automotive still ${index + 1}`}
            fill
            sizes="(min-width: 1280px) 660px, (min-width: 640px) 48vw, 78vw"
            unoptimized
            className="scale-[1.01] object-cover transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/10" />
        </div>
      </button>
    );
  }

  function renderCenterFrame(index: number) {
    const frame = frameItems[index];
    const openLabel = frame.href
      ? `Open still link ${index + 1}`
      : `Expand still ${index + 1}`;

    return (
      <div
        key={`center-${frame.image}-${index}`}
        className="group/frame absolute left-1/2 top-[8%] z-30 w-[78vw] -translate-x-1/2 sm:top-[10%] sm:w-[48%]"
      >
        <div
          data-selected-frame="center"
          className="film-frame relative overflow-hidden rounded-[2rem]"
        >
          <div className="aspect-[4/3]" />
          <FallbackImage
            src={frame.image}
            fallbackSrc={
              fallbackFrameImages[index % fallbackFrameImages.length]
            }
            alt={`Automotive still ${index + 1}`}
            fill
            sizes="(min-width: 1280px) 660px, (min-width: 640px) 48vw, 78vw"
            unoptimized
            className="object-cover transition-transform duration-700 group-hover/frame:scale-[1.03]"
          />

          <button
            type="button"
            aria-label={openLabel}
            data-selected-frame-control="open"
            onClick={() => openFrame(index)}
            className="group/expand absolute inset-y-0 left-[15%] right-[15%] z-20 flex items-center justify-center bg-black/0 transition-colors duration-300 hover:bg-black/25 focus-visible:bg-black/25 active:!scale-100"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/10 opacity-0 backdrop-blur transition-opacity duration-300 group-hover/expand:opacity-100 group-focus-visible/expand:opacity-100">
              <Expand className="h-5 w-5 text-white" />
            </span>
          </button>

          {frameItems.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Show previous still"
                data-selected-frame-control="previous"
                onClick={showPreviousFrame}
                className="group/navigation absolute -inset-y-px left-0 z-30 flex w-[15%] items-center justify-center bg-gradient-to-r from-black/40 via-black/10 to-transparent text-white transition-colors duration-300 hover:from-black/65 focus-visible:from-black/65 active:!scale-100"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/20 backdrop-blur transition-colors duration-300 group-hover/navigation:bg-black/45">
                  <ChevronLeft className="h-5 w-5" />
                </span>
              </button>
              <button
                type="button"
                aria-label="Show next still"
                data-selected-frame-control="next"
                onClick={showNextFrame}
                className="group/navigation absolute -inset-y-px right-0 z-30 flex w-[15%] items-center justify-center bg-gradient-to-l from-black/40 via-black/10 to-transparent text-white transition-colors duration-300 hover:from-black/65 focus-visible:from-black/65 active:!scale-100"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/20 backdrop-blur transition-colors duration-300 group-hover/navigation:bg-black/45">
                  <ChevronRight className="h-5 w-5" />
                </span>
              </button>
            </>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="section-shell section-space-tight pt-0">
        <div className="grid gap-6 border-b border-line pb-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <Reveal className="space-y-5">
            <p className="eyebrow">Large still imagery</p>
            <h2 className="font-[family-name:var(--font-display)] text-4xl uppercase leading-none sm:text-6xl">
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
              ? renderSideFrameButton({
                  index: previousIndex,
                  position: "left"
                })
              : null}
            {renderCenterFrame(focusedIndex)}
            {frameItems.length > 1
              ? renderSideFrameButton({ index: nextIndex, position: "right" })
              : null}
            {frameItems.length > 1 ? (
              <div className="absolute bottom-0 left-1/2 z-40 -translate-x-1/2">
                <span className="rounded-full border border-line bg-panel px-4 py-2 text-xs uppercase tracking-ui text-muted">
                  {focusedIndex + 1} / {frameItems.length}
                </span>
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
