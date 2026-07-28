"use client";

import {
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useRef,
  useState
} from "react";
import { FallbackImage } from "@/components/ui/fallback-image";
import type { FrameItem } from "@/lib/project-images";
import { cn } from "@/lib/utils";

type HorizontalStillStripProps = {
  frames?: FrameItem[];
  images?: string[];
  direction?: "left" | "right";
  eyebrow?: string;
  lead?: string;
  trail?: string;
  ariaLabel?: string;
  imageAltPrefix?: string;
};

const KEYBOARD_SCROLL_DISTANCE = 240;
const fallbackStripImages = [
  "/images/demo-car-02.jpg",
  "/images/demo-car-03.jpg",
  "/images/demo-car-04.jpg",
  "/images/demo-car-05.jpg",
  "/images/car-pictures/midnight-aeroline-03.jpg",
  "/images/car-pictures/alpine-vector-01.avif"
];

function isExternalLink(href?: string) {
  return Boolean(href && /^https?:\/\//i.test(href));
}

export function HorizontalStillStrip({
  frames,
  images = [],
  direction = "left",
  eyebrow,
  lead = "Selected",
  trail = "Frames",
  ariaLabel = "Selected frames. Use the left and right arrow keys to scroll through the image strip.",
  imageAltPrefix = "Selected still"
}: HorizontalStillStripProps) {
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragOrigin = useRef<number | null>(null);
  const scrollOrigin = useRef<number>(0);
  const frameItems: FrameItem[] = frames ?? images.map((image) => ({ image }));

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

  if (frameItems.length === 0) return null;

  /* ── Drag-to-scroll state ─────────────────────────────────────────── */
  const loop = [...frameItems, ...frameItems];

  function startDrag(clientX: number) {
    dragOrigin.current = clientX;
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
        <div>
          {eyebrow ? <p className="eyebrow mb-4">{eyebrow}</p> : null}
          <h2 className="font-[family-name:var(--font-display)] text-4xl uppercase leading-none sm:text-5xl">
            {lead}
            <span className="block pl-10 text-accent">{trail}</span>
          </h2>
        </div>
      </div>

      <div
        ref={trackRef}
        role="region"
        aria-label={ariaLabel}
        aria-keyshortcuts="ArrowLeft ArrowRight Home End"
        tabIndex={0}
        className="no-scrollbar focus-visible:ring-accent/60 overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
          className={cn(
            "marquee-track flex min-w-max gap-6 px-5 sm:px-8 lg:px-10",
            direction === "right" && "marquee-track-reverse"
          )}
          style={{
            animationPlayState: paused || !inView ? "paused" : "running",
            cursor: paused ? "grabbing" : "grab"
          }}
        >
          {loop.map((frame, index) => (
            <a
              key={`${frame.image}-${index}`}
              href={frame.href}
              target={isExternalLink(frame.href) ? "_blank" : undefined}
              rel={isExternalLink(frame.href) ? "noreferrer" : undefined}
              data-project-frame-link={
                frame.href?.startsWith("/work/") || undefined
              }
              aria-hidden={index >= frameItems.length}
              aria-label={
                index >= frameItems.length
                  ? undefined
                  : frame.href
                    ? `Open ${imageAltPrefix.toLowerCase()} ${(index % frameItems.length) + 1}`
                    : `${imageAltPrefix} ${(index % frameItems.length) + 1}`
              }
              tabIndex={frame.href && index < frameItems.length ? 0 : -1}
              className="film-frame relative h-[220px] w-[320px] shrink-0 overflow-hidden rounded-[1.75rem] sm:h-[260px] sm:w-[440px]"
            >
              <FallbackImage
                src={frame.image}
                fallbackSrc={
                  fallbackStripImages[index % fallbackStripImages.length]
                }
                alt={
                  index >= frameItems.length
                    ? ""
                    : `${imageAltPrefix} ${(index % frameItems.length) + 1}`
                }
                fill
                sizes="(min-width: 640px) 440px, 320px"
                unoptimized
                className="object-cover"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
