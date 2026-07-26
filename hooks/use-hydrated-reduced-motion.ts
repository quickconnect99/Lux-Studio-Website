"use client";

import { useEffect, useState } from "react";
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
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated && Boolean(prefersReducedMotion);
}
