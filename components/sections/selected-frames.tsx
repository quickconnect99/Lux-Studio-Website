"use client";

import Image from "next/image";
import { useState } from "react";
import { Expand } from "lucide-react";
import { Lightbox } from "@/components/ui/lightbox";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

type SelectedFramesProps = {
  images: string[];
};

export function SelectedFrames({ images }: SelectedFramesProps) {
  const frameImages = images.slice(0, 3);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (frameImages.length === 0) return null;

  function openLightbox(index: number) {
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

        <div className="grid gap-6 pt-8 lg:grid-cols-[1.18fr_0.82fr]">
          <Reveal variant="default" className="order-1">
            <button
              type="button"
              aria-label="Expand still 1"
              onClick={() => openLightbox(0)}
              className="group relative w-full focus-visible:outline-none"
            >
              <div className="film-frame relative overflow-hidden rounded-[2rem]">
                <div className="aspect-[16/10]" />
                <Image
                  src={frameImages[0]}
                  alt="Automotive still 1"
                  fill
                  sizes="(min-width: 1024px) 62vw, 100vw"
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
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            {frameImages.slice(1).map((image, index) => (
              <Reveal
                key={image}
                variant="subtle"
                delay={(index + 1) * 0.05}
                direction="right"
              >
                <button
                  type="button"
                  aria-label={`Expand still ${index + 2}`}
                  onClick={() => openLightbox(index + 1)}
                  className="group relative w-full focus-visible:outline-none"
                >
                  <div className="film-frame relative overflow-hidden rounded-[2rem]">
                    <div className="aspect-[4/3]" />
                    <Image
                      src={image}
                      alt={`Automotive still ${index + 2}`}
                      fill
                      sizes="(min-width: 1024px) 32vw, (min-width: 640px) 50vw, 100vw"
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
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Lightbox
        images={frameImages}
        activeIndex={activeIndex}
        onClose={closeLightbox}
        onPrev={prev}
        onNext={next}
      />
    </>
  );
}
