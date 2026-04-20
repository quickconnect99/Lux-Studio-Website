"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Reveal variant controls offset distance and animation duration.
 *
 * subtle  – 18 px, 0.55 s → dense lists, grids
 * default – 36 px, 0.80 s → most sections
 * bold    – 60 px, 1.00 s → hero / featured elements
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

const variantConfig: Record<RevealVariant, { offset: number; duration: number }> = {
  subtle: { offset: 18, duration: 0.55 },
  default: { offset: 36, duration: 0.8 },
  bold: { offset: 60, duration: 1.0 }
};

function buildOffset(direction: "up" | "left" | "right", offset: number) {
  if (direction === "left")  return { x: -offset, y: 0 };
  if (direction === "right") return { x: offset,  y: 0 };
  return { x: 0, y: offset };
}

export function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
  variant = "default"
}: RevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const [revealed, setRevealed] = useState(false);
  const { offset, duration } = variantConfig[variant];
  const initialOffset = buildOffset(direction, offset);

  if (shouldReduceMotion) {
    return (
      <div className={cn("group-reveal", className)}>{children}</div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, ...initialOffset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "0px 0px 18% 0px" }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={() => setRevealed(true)}
      className={cn(revealed && "group-reveal", className)}
    >
      {children}
    </motion.div>
  );
}
