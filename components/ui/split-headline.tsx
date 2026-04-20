import { cn } from "@/lib/utils";

export type SplitHeadlineProps = {
  lead: string;
  trail: string;
  eyebrow?: string;
  copy?: string;
  align?: "left" | "center";
  className?: string;
};

/**
 * Large display headline split into two lines:
 *   lead  – left-aligned, foreground colour
 *   trail – indented, accent colour with an animated underline gradient
 *
 * The underline on `trail` is triggered by the `.group-reveal` class on a
 * parent element (set automatically by the Reveal component's wrapper, or
 * manually when the headline is already visible at load time).
 */
export function SplitHeadline({
  lead,
  trail,
  eyebrow,
  copy,
  align = "left",
  className
}: SplitHeadlineProps) {
  return (
    <div
      className={cn(
        "space-y-5",
        align === "center" && "text-center",
        className
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            "text-xs uppercase tracking-eyebrow text-muted",
            align === "center" && "justify-center"
          )}
        >
          {eyebrow}
        </p>
      ) : null}

      <div className="font-[family:var(--font-display)] space-y-1 text-[clamp(3rem,8vw,7rem)] uppercase leading-[0.88] tracking-[-0.04em]">
        <div>{lead}</div>
        {/* split-trail-underline draws the animated accent line (see globals.css) */}
        <div className="pl-6 text-accent sm:pl-12">
          <span className="split-trail-underline">{trail}</span>
        </div>
      </div>

      {copy ? (
        <p
          className={cn(
            "max-w-2xl text-base leading-8 text-muted sm:text-lg",
            align === "center" && "mx-auto"
          )}
        >
          {copy}
        </p>
      ) : null}
    </div>
  );
}
