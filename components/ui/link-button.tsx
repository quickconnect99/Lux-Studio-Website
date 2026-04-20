import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type LinkButtonVariant = "primary" | "secondary" | "ghost";

export type LinkButtonProps = {
  href: string;
  children: ReactNode;
  variant?: LinkButtonVariant;
  className?: string;
};

export function LinkButton({
  href,
  children,
  variant = "primary",
  className
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        // base
        "group inline-flex items-center gap-3 rounded-full border px-5 py-3",
        "text-xs font-medium uppercase tracking-ui",
        // press feedback (scale defined in globals.css via a:active)
        "active:scale-95",
        // variants
        variant === "primary" && [
          "border-foreground bg-foreground text-background",
          "hover:bg-accent hover:text-accent-contrast hover:border-accent"
        ],
        variant === "secondary" && [
          "border-line bg-panel-secondary text-foreground",
          "hover:border-accent hover:bg-panel"
        ],
        variant === "ghost" && [
          "border-transparent bg-transparent px-0 text-foreground",
          "hover:text-foreground/80"
        ],
        className
      )}
    >
      {children}
      {/* Icon animates diagonally and slightly scales on hover */}
      <ArrowUpRight
        className={cn(
          "h-4 w-4 shrink-0",
          "transition-transform duration-300 ease-out",
          "group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:scale-110"
        )}
      />
    </Link>
  );
}
