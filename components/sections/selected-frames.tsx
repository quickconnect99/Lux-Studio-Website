"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { FallbackImage } from "@/components/ui/fallback-image";
import { Reveal } from "@/components/ui/reveal";
import { motionDuration, motionEase } from "@/lib/motion";
import type { FrameItem } from "@/lib/project-images";
import { cn } from "@/lib/utils";

const Lightbox = dynamic(
  () => import("@/components/ui/lightbox").then((module) => module.Lightbox),
  { ssr: false }
);

type SelectedFramesProps = {
  frames: FrameItem[];
  label: string;
};

const fallbackFrameImages = [
  "/images/demo-car-02.jpg",
  "/images/demo-car-03.jpg",
  "/images/demo-car-04.jpg",
  "/images/demo-car-05.jpg"
];

export function SelectedFrames({ frames, label }: SelectedFramesProps) {
  const frameItems = frames;
  const frameImages = frameItems.map((frame) => frame.image);
  const frameAlts = frameItems.map(
    (frame, index) => frame.alt ?? `Selected project still ${index + 1}`
  );
  const shouldReduceMotion = useReducedMotion();
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hasOpenedLightbox, setHasOpenedLightbox] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<-1 | 1>(1);

  if (frameItems.length === 0) return null;

  const previousIndex =
    (focusedIndex - 1 + frameItems.length) % frameItems.length;
  const nextIndex = (focusedIndex + 1) % frameItems.length;

  function openFrame(index: number) {
    setHasOpenedLightbox(true);
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
    setTransitionDirection(-1);
    setFocusedIndex(previousIndex);
  }

  function showNextFrame() {
    setTransitionDirection(1);
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
        key={`side-${position}`}
        type="button"
        aria-label={
          position === "left"
            ? "Select previous still preview"
            : "Select next still preview"
        }
        onClick={() => {
          setTransitionDirection(position === "left" ? -1 : 1);
          setFocusedIndex(index);
        }}
        className={cn(
          "group absolute top-[30%] z-10 w-[78vw] opacity-90 focus-visible:outline-none sm:w-[46%]",
          "transition-[opacity,transform] duration-500 ease-out",
          position === "left" && "-left-[47vw] sm:left-0 lg:left-0",
          position === "right" && "-right-[47vw] sm:right-0 lg:right-0"
        )}
      >
        <div className="film-frame relative overflow-hidden rounded-[2rem]">
          <div className="aspect-[4/3]" />
          <AnimatePresence initial={false} custom={transitionDirection}>
            <m.div
              key={`${position}-${frame.image}-${index}`}
              initial={
                shouldReduceMotion
                  ? false
                  : {
                      opacity: 0,
                      x: transitionDirection * 24,
                      scale: 1.035
                    }
              }
              animate={{ opacity: 1, x: 0, scale: 1.01 }}
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      x: transitionDirection * -18,
                      scale: 0.99
                    }
              }
              transition={{
                duration: shouldReduceMotion ? 0 : motionDuration.content,
                ease: motionEase
              }}
              className="absolute inset-0"
              style={{ willChange: "transform, opacity" }}
            >
              <FallbackImage
                src={frame.image}
                fallbackSrc={
                  fallbackFrameImages[index % fallbackFrameImages.length]
                }
                alt={frame.alt ?? `Selected project still ${index + 1}`}
                fill
                sizes="(min-width: 1280px) 660px, (min-width: 640px) 48vw, 78vw"
                className="object-cover"
              />
            </m.div>
          </AnimatePresence>
          <div className="absolute inset-0 z-10 bg-black/20 transition-colors duration-300 group-hover:bg-black/10" />
        </div>
      </button>
    );
  }

  function renderCenterFrame(index: number) {
    const frame = frameItems[index];
    const openLabel = `Expand still ${index + 1}`;
    const projectLinkClass =
      "absolute bottom-4 left-1/2 z-40 inline-flex min-h-11 -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-white/30 bg-black/60 px-4 py-2 text-xs uppercase tracking-ui text-white backdrop-blur transition-colors hover:border-accent hover:bg-black/80";

    return (
      <div
        key="center-frame"
        className="group/frame absolute left-1/2 top-[8%] z-30 w-[78vw] -translate-x-1/2 sm:top-[10%] sm:w-[48%]"
      >
        <div
          data-selected-frame="center"
          className="film-frame relative overflow-hidden rounded-[2rem]"
        >
          <div className="aspect-[4/3]" />
          <AnimatePresence initial={false} custom={transitionDirection}>
            <m.div
              key={`${frame.image}-${index}`}
              data-selected-frame-image={index}
              initial={
                shouldReduceMotion
                  ? false
                  : {
                      opacity: 0,
                      x: transitionDirection * 38,
                      scale: 1.055
                    }
              }
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      x: transitionDirection * -28,
                      scale: 0.985
                    }
              }
              transition={{
                duration: shouldReduceMotion ? 0 : motionDuration.hero,
                ease: motionEase
              }}
              className="absolute inset-0"
              style={{ willChange: "transform, opacity" }}
            >
              <div className="absolute inset-0 transition-transform duration-700 group-hover/frame:scale-[1.03]">
                <FallbackImage
                  src={frame.image}
                  fallbackSrc={
                    fallbackFrameImages[index % fallbackFrameImages.length]
                  }
                  alt={frame.alt ?? `Selected project still ${index + 1}`}
                  fill
                  sizes="(min-width: 1280px) 660px, (min-width: 640px) 48vw, 78vw"
                  className="object-cover"
                />
              </div>
            </m.div>
          </AnimatePresence>

          <m.div
            key={`light-sweep-${index}-${transitionDirection}`}
            aria-hidden="true"
            initial={{
              x: transitionDirection > 0 ? "-125%" : "340%",
              opacity: 0
            }}
            animate={{
              x: transitionDirection > 0 ? "340%" : "-125%",
              opacity: [0, 0.62, 0]
            }}
            transition={{
              duration: shouldReduceMotion ? 0 : motionDuration.hero,
              ease: motionEase
            }}
            className="pointer-events-none absolute inset-y-0 z-10 w-[42%] bg-gradient-to-r from-transparent via-white/20 to-transparent mix-blend-screen"
            style={{ willChange: "transform, opacity" }}
          />

          <button
            type="button"
            aria-label={openLabel}
            data-selected-frame-control="open"
            onClick={() => openFrame(index)}
            className="group/expand absolute inset-y-0 left-[15%] right-[15%] z-20 flex items-center justify-center bg-black/0 transition-colors duration-300 hover:bg-black/25 focus-visible:bg-black/25 active:!scale-100"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-black/35 opacity-100 backdrop-blur transition-opacity duration-300 sm:opacity-0 sm:group-hover/expand:opacity-100 sm:group-focus-visible/expand:opacity-100">
              <Expand className="h-5 w-5 text-white" />
            </span>
          </button>

          {frame.href ? (
            /^https?:\/\//i.test(frame.href) ? (
              <a
                href={frame.href}
                target="_blank"
                rel="noreferrer"
                className={projectLinkClass}
              >
                View Project
                <ArrowUpRight className="h-4 w-4" />
              </a>
            ) : (
              <Link href={frame.href} className={projectLinkClass}>
                View Project
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            )
          ) : null}

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
            <p className="eyebrow">{label}</p>
            <h2 className="font-[family-name:var(--font-display)] text-4xl uppercase leading-none sm:text-6xl">
              Shot
              <span className="block pl-8 text-accent-text sm:pl-12">
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
              <div
                aria-live="polite"
                className="absolute bottom-0 left-1/2 z-40 min-w-[4rem] -translate-x-1/2 overflow-hidden rounded-full border border-line bg-panel px-4 py-2 text-center text-xs uppercase tracking-ui text-muted"
              >
                <AnimatePresence initial={false} mode="wait">
                  <m.span
                    key={focusedIndex}
                    initial={
                      shouldReduceMotion
                        ? false
                        : {
                            opacity: 0,
                            y: transitionDirection * 8
                          }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    exit={
                      shouldReduceMotion
                        ? { opacity: 0 }
                        : {
                            opacity: 0,
                            y: transitionDirection * -8
                          }
                    }
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.24,
                      ease: "easeOut"
                    }}
                    className="block"
                  >
                    {focusedIndex + 1} / {frameItems.length}
                  </m.span>
                </AnimatePresence>
              </div>
            ) : null}
          </div>
        </Reveal>
      </section>

      {hasOpenedLightbox ? (
        <Lightbox
          images={frameImages}
          imageAlts={frameAlts}
          fallbackImages={fallbackFrameImages}
          activeIndex={activeIndex}
          onClose={closeLightbox}
          onPrev={prev}
          onNext={next}
        />
      ) : null}
    </>
  );
}
