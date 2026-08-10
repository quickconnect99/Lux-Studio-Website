"use client";

import { m } from "framer-motion";
import { useState } from "react";
import { useHydratedReducedMotion } from "@/hooks/use-hydrated-reduced-motion";
import { motionDuration, motionEase } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Reveal variant controls offset distance and animation duration.
 *
 * subtle  – 18 px, 0.38 s → dense lists, grids
 * default – 30 px, 0.48 s → most sections
 * bold    – 44 px, 0.55 s → hero / featured elements
 *
 * Once the entrance animation completes, the wrapper gains the class
 * `group-reveal` so child CSS (e.g. `.split-trail-underline::after`)
 * can trigger sequenced effects.
 */
export type RevealVariant = "subtle" | "default" | "bold";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right";
  variant?: RevealVariant;
};

const variantConfig: Record<
  RevealVariant,
  { offset: number; duration: number }
> = {
  subtle: { offset: 18, duration: motionDuration.content },
  default: { offset: 30, duration: 0.48 },
  bold: { offset: 44, duration: 0.55 }
};

function buildOffset(direction: "up" | "left" | "right", offset: number) {
  // The smallest layout gutter is 16px. Keeping horizontal reveals within
  // that gutter prevents transformed cards from widening the mobile document.
  const horizontalOffset = Math.min(offset, 16);

  if (direction === "left") return { x: -horizontalOffset, y: 0 };
  if (direction === "right") return { x: horizontalOffset, y: 0 };
  return { x: 0, y: offset };
}

export function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
  variant = "default"
}: RevealProps) {
  const shouldReduceMotion = useHydratedReducedMotion();
  const [revealed, setRevealed] = useState(false);
  const { offset, duration } = variantConfig[variant];
  const initialOffset = buildOffset(direction, offset);

  if (shouldReduceMotion) {
    return <div className={cn("group-reveal", className)}>{children}</div>;
  }

  return (
    <m.div
      initial={{ opacity: 1, ...initialOffset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration, delay, ease: motionEase }}
      onAnimationComplete={() => setRevealed(true)}
      className={cn(revealed && "group-reveal", className)}
    >
      {children}
    </m.div>
  );
}
