"use client";

import Image from "next/image";
import {
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useRef,
  useState
} from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type HorizontalStillStripProps = {
  images: string[];
  direction?: "left" | "right";
  collapsible?: boolean;
  eyebrow?: string;
  lead?: string;
  trail?: string;
};

const KEYBOARD_SCROLL_DISTANCE = 240;

export function HorizontalStillStrip({
  images,
  direction = "left",
  collapsible = false,
  eyebrow,
  lead = "Selected",
  trail = "Frames"
}: HorizontalStillStripProps) {
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [visible, setVisible] = useState(true);
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
      <div className="section-shell mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          {eyebrow ? <p className="eyebrow mb-4">{eyebrow}</p> : null}
          <h2 className="font-[family:var(--font-display)] text-4xl uppercase leading-none sm:text-5xl">
            {lead}
            <span className="block pl-10 text-accent">{trail}</span>
          </h2>
        </div>
        {collapsible ? (
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            className="control-pill"
            aria-expanded={visible}
          >
            {visible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            {visible ? "Hide Reel" : "Show Reel"}
          </button>
        ) : null}
      </div>

      {visible ? (
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
            className={cn(
              "marquee-track flex min-w-max gap-6 px-5 sm:px-8 lg:px-10",
              direction === "right" && "marquee-track-reverse"
            )}
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
      ) : null}
    </section>
  );
}
