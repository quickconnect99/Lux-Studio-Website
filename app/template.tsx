"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useHydratedReducedMotion } from "@/hooks/use-hydrated-reduced-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const shouldReduceMotion = useHydratedReducedMotion();

  return (
    <motion.main
      key={pathname}
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
      }
      className="relative"
    >
      {children}
    </motion.main>
  );
}
