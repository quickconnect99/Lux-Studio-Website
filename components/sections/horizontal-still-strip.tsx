"use client";

import Image from "next/image";
import { type KeyboardEvent as ReactKeyboardEvent, useEffect, useRef, useState } from "react";

type HorizontalStillStripProps = {
  images: string[];
};

const KEYBOARD_SCROLL_DISTANCE = 240;

export function HorizontalStillStrip({ images }: HorizontalStillStripProps) {
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragOrigin = useRef<number | null>(null);
  const scrollOrigin = useRef<number>(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (images.length === 0) return null;

  /* ── Drag-to-scroll state ─────────────────────────────────────────── */
  const loop = [...images, ...images];

  function startDrag(clientX: number) {
    dragOrigin.current   = clientX;
    scrollOrigin.current = trackRef.current?.scrollLeft ?? 0;
    setPaused(true);
  }

  function moveDrag(clientX: number) {
    if (dragOrigin.current === null || !trackRef.current) return;
    const delta = dragOrigin.current - clientX;
    trackRef.current.scrollLeft = scrollOrigin.current + delta;
  }

  function endDrag() {
    dragOrigin.current = null;
    setPaused(false);
  }

  function scrollByAmount(amount: number) {
    trackRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (!trackRef.current) {
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setPaused(true);
      scrollByAmount(-KEYBOARD_SCROLL_DISTANCE);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      setPaused(true);
      scrollByAmount(KEYBOARD_SCROLL_DISTANCE);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setPaused(true);
      trackRef.current.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setPaused(true);
      trackRef.current.scrollTo({
        left: trackRef.current.scrollWidth,
        behavior: "smooth"
      });
    }
  }

  return (
    <section ref={sectionRef} className="section-space-medium overflow-hidden">
      <div className="section-shell mb-8">
        <h2 className="font-[family:var(--font-display)] text-4xl uppercase leading-none sm:text-5xl">
          Selected
          <span className="block pl-10 text-accent">Frames</span>
        </h2>
      </div>

      {/*
       * The outer div is the scroll container (overflow-x: auto, hidden
       * scrollbar). The inner .marquee-track runs the CSS animation.
       * Hover OR drag pauses the animation via animationPlayState.
       * Mouse/touch drag also shifts scrollLeft for manual panning.
       */}
      <div
        ref={trackRef}
        role="region"
        aria-label="Selected frames. Use the left and right arrow keys to scroll through the image strip."
        aria-keyshortcuts="ArrowLeft ArrowRight Home End"
        tabIndex={0}
        className="no-scrollbar overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        onFocus={() => setPaused(true)}
        onBlur={endDrag}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => {
          endDrag();
        }}
        onMouseDown={(e) => startDrag(e.clientX)}
        onMouseMove={(e) => moveDrag(e.clientX)}
        onMouseUp={endDrag}
        onTouchStart={(e) => startDrag(e.touches[0].clientX)}
        onTouchMove={(e) => moveDrag(e.touches[0].clientX)}
        onTouchEnd={endDrag}
      >
        <div
          className="marquee-track flex min-w-max gap-6 px-5 sm:px-8 lg:px-10"
          style={{
            animationPlayState: paused || !inView ? "paused" : "running",
            cursor: paused ? "grabbing" : "grab"
          }}
        >
          {loop.map((image, index) => (
            <div
              key={`${image}-${index}`}
              aria-hidden={index >= images.length}
              className="film-frame relative h-[220px] w-[320px] shrink-0 overflow-hidden rounded-[1.75rem] sm:h-[260px] sm:w-[440px]"
            >
              <Image
                src={image}
                alt={
                  index >= images.length
                    ? ""
                    : `Selected still ${(index % images.length) + 1}`
                }
                fill
                sizes="(min-width: 640px) 440px, 320px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
