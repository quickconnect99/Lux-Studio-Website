"use client";

import { useSyncExternalStore } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Keeps the server render and the first client render identical.
 *
 * `useReducedMotion()` can already know the browser preference during
 * hydration, while the server cannot. Deferring that value until after mount
 * prevents React from hydrating two different element trees.
 */
export function useHydratedReducedMotion() {
  const prefersReducedMotion = useReducedMotion();
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );

  return hydrated && Boolean(prefersReducedMotion);
}
