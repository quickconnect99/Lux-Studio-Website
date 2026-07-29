"use client";

import { useEffect, useRef, type RefObject } from "react";

const focusableSelector = [
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])'
].join(", ");

type UseFocusTrapDialogOptions = {
  active: boolean;
  containerRef: RefObject<HTMLElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null>;
  initialFocusSelector?: string;
  onClose: () => void;
  canClose?: boolean;
};

/**
 * Applies accessible modal behavior while a dialog is active.
 *
 * Focus moves inside the dialog, Tab wraps between focusable controls, Escape
 * requests close when permitted, background scrolling is locked, and the
 * previously focused element is restored during cleanup.
 */
export function useFocusTrapDialog({
  active,
  containerRef,
  initialFocusRef,
  initialFocusSelector,
  onClose,
  canClose = true
}: UseFocusTrapDialogOptions) {
  const currentOptionsRef = useRef({ onClose, canClose });

  useEffect(() => {
    currentOptionsRef.current = { onClose, canClose };
  }, [canClose, onClose]);

  useEffect(() => {
    if (!active) {
      return;
    }

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && currentOptionsRef.current.canClose) {
        currentOptionsRef.current.onClose();
        return;
      }

      if (event.key !== "Tab" || !containerRef.current) {
        return;
      }

      const focusable = Array.from(
        containerRef.current.querySelectorAll<HTMLElement>(focusableSelector)
      ).filter((element) => !element.hasAttribute("aria-hidden"));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!first || !last) {
        event.preventDefault();
        containerRef.current.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    const animationFrame = window.requestAnimationFrame(() => {
      const selectedTarget = initialFocusSelector
        ? containerRef.current?.querySelector<HTMLElement>(initialFocusSelector)
        : null;
      (
        selectedTarget ??
        initialFocusRef?.current ??
        containerRef.current
      )?.focus();
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [active, containerRef, initialFocusRef, initialFocusSelector]);
}
