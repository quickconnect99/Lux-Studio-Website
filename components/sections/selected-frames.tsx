"use client";

import { useState } from "react";
import { Expand } from "lucide-react";
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
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (frameItems.length === 0) return null;

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

  function getFramePositionClass(index: number) {
    const position = index % 3;

    if (position === 1) {
      return "lg:-translate-y-8 lg:z-20";
    }

    return position === 0 ? "lg:translate-y-7" : "lg:translate-y-7";
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
          <div className="no-scrollbar -mx-4 snap-x snap-mandatory overflow-x-auto px-4 pb-12 pt-8 sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10">
            <div className="flex min-w-max items-start gap-4 sm:gap-5 lg:gap-6">
              {frameItems.map((frame, index) => (
                <button
                  key={`${frame.image}-${index}`}
                  type="button"
                  aria-label={
                    frame.href
                      ? `Open still link ${index + 1}`
                      : `Expand still ${index + 1}`
                  }
                  onClick={() => openFrame(index)}
                  className={cn(
                    "group relative w-[78vw] shrink-0 snap-center focus-visible:outline-none",
                    "sm:w-[44vw] lg:w-[calc((100vw-8rem)/3)] xl:w-[calc((1440px-8rem)/3)]",
                    "transition-transform duration-500 ease-out",
                    getFramePositionClass(index)
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
                      sizes="(min-width: 1280px) 420px, (min-width: 1024px) 31vw, (min-width: 640px) 44vw, 78vw"
                      unoptimized
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                    <div
                      className={cn(
                        "absolute inset-0 flex items-center justify-center",
                        "bg-black/0 transition-colors duration-300 group-hover:bg-black/30"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-full",
                          "border border-white/30 bg-white/10 opacity-0 backdrop-blur",
                          "transition-opacity duration-300 group-hover:opacity-100"
                        )}
                      >
                        <Expand className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
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
