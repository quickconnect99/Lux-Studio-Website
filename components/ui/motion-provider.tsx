"use client";

import { domAnimation, LazyMotion, MotionConfig } from "framer-motion";
import type { ReactNode } from "react";
import {
  MotionPreferenceProvider,
  useMotionPreference
} from "@/components/ui/motion-preference-provider";

/**
 * Bridges the app's own motion toggle into framer-motion's reduced-motion
 * setting, so every existing `m.*`/`whileInView` consumer collapses to its
 * already-coded reduced-motion branch when the toggle is off — no per-
 * component wiring needed. "never"/"always" (not "user") make our own
 * preference the single source of truth instead of layering on top of the
 * OS-level query a second time.
 */
function MotionConfigBridge({ children }: { children: ReactNode }) {
  const { enabled } = useMotionPreference();

  return (
    <MotionConfig reducedMotion={enabled ? "never" : "always"}>
      {children}
    </MotionConfig>
  );
}

/**
 * Establishes framer-motion's `m.*` context for the public marketing site.
 *
 * Every `m.*` usage in the app lives under `(site)` — the admin workspace
 * has none — so this stays scoped to the public layout instead of the root
 * layout, keeping the animation runtime chunk out of the `/admin` bundle.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionPreferenceProvider>
        <MotionConfigBridge>{children}</MotionConfigBridge>
      </MotionPreferenceProvider>
    </LazyMotion>
  );
}
