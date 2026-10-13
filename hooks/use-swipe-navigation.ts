"use client";

import { useRef, type PointerEvent, type MouseEvent } from "react";

/** Horizontal touch gestures leave vertical page scrolling available. */
export function useSwipeNavigation(onPrevious: () => void, onNext: () => void) {
  const origin = useRef<{ x: number; y: number; id: number } | null>(null);
  const suppressClickUntil = useRef(0);

  return {
    onPointerDown(event: PointerEvent<HTMLElement>) {
      if (event.pointerType === "mouse" || !event.isPrimary) return;
      origin.current = {
        x: event.clientX,
        y: event.clientY,
        id: event.pointerId
      };
    },
    onPointerUp(event: PointerEvent<HTMLElement>) {
      const start = origin.current;
      origin.current = null;
      if (!start || start.id !== event.pointerId) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      suppressClickUntil.current = Date.now() + 400;
      if (dx > 0) onPrevious();
      else onNext();
    },
    onPointerCancel() {
      origin.current = null;
    },
    onClickCapture(event: MouseEvent<HTMLElement>) {
      if (event.detail > 0 && Date.now() < suppressClickUntil.current) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
  };
}
