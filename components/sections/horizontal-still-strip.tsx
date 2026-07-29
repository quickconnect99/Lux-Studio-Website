"use client";

import {
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore
} from "react";
import Link from "next/link";
import { Pause, Play } from "lucide-react";
import { FallbackImage } from "@/components/ui/fallback-image";
import { useHydratedReducedMotion } from "@/hooks/use-hydrated-reduced-motion";
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
const MOTION_STRIP_PAUSE_STORAGE_KEY = "lux-studio:motion-strip-paused";
const MOTION_STRIP_PAUSE_EVENT = "lux-studio:motion-strip-pause-change";
let sessionMotionPaused = false;
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

function subscribeToMotionPause(callback: () => void) {
  function handleStorage(event: StorageEvent) {
    if (event.key === MOTION_STRIP_PAUSE_STORAGE_KEY) callback();
  }

  window.addEventListener(MOTION_STRIP_PAUSE_EVENT, callback);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(MOTION_STRIP_PAUSE_EVENT, callback);
    window.removeEventListener("storage", handleStorage);
  };
}

function getMotionPauseSnapshot() {
  try {
    return localStorage.getItem(MOTION_STRIP_PAUSE_STORAGE_KEY) === "true";
  } catch {
    return sessionMotionPaused;
  }
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
  const shouldReduceMotion = useHydratedReducedMotion();
  const [interactionPaused, setInteractionPaused] = useState(false);
  const userPaused = useSyncExternalStore(
    subscribeToMotionPause,
    getMotionPauseSnapshot,
    () => false
  );
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragOrigin = useRef<number | null>(null);
  const scrollOrigin = useRef<number>(0);
  const activePointerId = useRef<number | null>(null);
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

  useEffect(() => {
    function handleVisibilityChange() {
      setPageVisible(document.visibilityState === "visible");
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  if (frameItems.length === 0) return null;

  /* ── Drag-to-scroll state ─────────────────────────────────────────── */
  const loop = [...frameItems, ...frameItems];

  function startDrag(clientX: number) {
    dragOrigin.current = clientX;
    scrollOrigin.current = trackRef.current?.scrollLeft ?? 0;
    setInteractionPaused(true);
  }

  function moveDrag(clientX: number) {
    if (dragOrigin.current === null || !trackRef.current) return;
    const delta = dragOrigin.current - clientX;
    trackRef.current.scrollLeft = scrollOrigin.current + delta;
  }

  function endDrag() {
    dragOrigin.current = null;
    setInteractionPaused(false);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    activePointerId.current = event.pointerId;
    startDrag(event.clientX);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (
      activePointerId.current !== event.pointerId ||
      dragOrigin.current === null
    ) {
      return;
    }

    if (
      Math.abs(event.clientX - dragOrigin.current) > 6 &&
      !event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    moveDrag(event.clientX);
  }

  function handlePointerEnd(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    activePointerId.current = null;
    endDrag();
  }

  function scrollByAmount(amount: number) {
    trackRef.current?.scrollBy({
      left: amount,
      behavior: shouldReduceMotion ? "auto" : "smooth"
    });
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (!trackRef.current) {
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setInteractionPaused(true);
      scrollByAmount(-KEYBOARD_SCROLL_DISTANCE);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      setInteractionPaused(true);
      scrollByAmount(KEYBOARD_SCROLL_DISTANCE);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setInteractionPaused(true);
      trackRef.current.scrollTo({
        left: 0,
        behavior: shouldReduceMotion ? "auto" : "smooth"
      });
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setInteractionPaused(true);
      trackRef.current.scrollTo({
        left: trackRef.current.scrollWidth,
        behavior: shouldReduceMotion ? "auto" : "smooth"
      });
    }
  }

  function togglePlayback() {
    const nextPaused = !userPaused;
    sessionMotionPaused = nextPaused;
    try {
      localStorage.setItem(MOTION_STRIP_PAUSE_STORAGE_KEY, String(nextPaused));
    } catch {
      // The in-memory preference still applies for the current page.
    }
    window.dispatchEvent(new Event(MOTION_STRIP_PAUSE_EVENT));
  }

  const isAnimationPaused =
    shouldReduceMotion ||
    userPaused ||
    interactionPaused ||
    !inView ||
    !pageVisible;

  return (
    <section ref={sectionRef} className="section-space-medium overflow-hidden">
      <div className="section-shell mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          {eyebrow ? <p className="eyebrow mb-4">{eyebrow}</p> : null}
          <h2 className="font-[family-name:var(--font-display)] text-4xl uppercase leading-none sm:text-6xl">
            {lead}
            <span className="block pl-10 text-accent-text">{trail}</span>
          </h2>
        </div>
        <button
          type="button"
          data-motion-strip-toggle
          aria-pressed={shouldReduceMotion || userPaused}
          onClick={togglePlayback}
          disabled={shouldReduceMotion}
          className="control-pill shrink-0 active:!scale-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {shouldReduceMotion || userPaused ? (
            <Play className="h-4 w-4" />
          ) : (
            <Pause className="h-4 w-4" />
          )}
          {shouldReduceMotion
            ? "Motion reduced"
            : userPaused
              ? "Play strip"
              : "Pause strip"}
        </button>
      </div>

      <div
        ref={trackRef}
        role="region"
        aria-label={ariaLabel}
        aria-keyshortcuts="ArrowLeft ArrowRight Home End"
        tabIndex={0}
        className="no-scrollbar overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        onFocus={() => setInteractionPaused(true)}
        onBlur={endDrag}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setInteractionPaused(true)}
        onMouseLeave={() => {
          endDrag();
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <div
          className={cn(
            "marquee-track flex min-w-max gap-6 px-5 sm:px-8 lg:px-10",
            direction === "right" && "marquee-track-reverse"
          )}
          style={{
            animationPlayState: isAnimationPaused ? "paused" : "running",
            cursor: interactionPaused ? "grabbing" : "grab"
          }}
        >
          {loop.map((frame, index) => {
            const isDuplicate = index >= frameItems.length;
            const card = (
              <FallbackImage
                src={frame.image}
                fallbackSrc={
                  fallbackStripImages[index % fallbackStripImages.length]
                }
                alt={
                  isDuplicate
                    ? ""
                    : (frame.alt ??
                      `${imageAltPrefix} ${(index % frameItems.length) + 1}`)
                }
                fill
                sizes="(min-width: 1024px) 520px, (min-width: 640px) 480px, 340px"
                draggable={false}
                className="pointer-events-none object-cover"
              />
            );
            const sharedProps = {
              "data-project-frame-link":
                frame.href?.startsWith("/work/") || undefined,
              "aria-hidden": isDuplicate || undefined,
              "aria-label": isDuplicate
                ? undefined
                : frame.href
                  ? `Open ${frame.projectTitle ?? `${imageAltPrefix} ${(index % frameItems.length) + 1}`}`
                  : (frame.alt ??
                    `${imageAltPrefix} ${(index % frameItems.length) + 1}`),
              tabIndex: frame.href && !isDuplicate ? 0 : -1,
              className:
                "film-frame relative h-[245px] w-[340px] shrink-0 overflow-hidden rounded-[1.75rem] sm:h-[300px] sm:w-[480px] lg:h-[320px] lg:w-[520px]"
            };

            if (frame.href && !isExternalLink(frame.href)) {
              return (
                <Link
                  key={`${frame.image}-${frame.href}-${index}`}
                  href={frame.href}
                  {...sharedProps}
                >
                  {card}
                </Link>
              );
            }

            if (frame.href) {
              return (
                <a
                  key={`${frame.image}-${frame.href}-${index}`}
                  href={frame.href}
                  target="_blank"
                  rel="noreferrer"
                  {...sharedProps}
                >
                  {card}
                </a>
              );
            }

            return (
              <div key={`${frame.image}-${index}`} {...sharedProps}>
                {card}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
