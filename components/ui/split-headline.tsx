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

      <h1 className="space-y-1 break-words font-[family-name:var(--font-display)] text-[clamp(2.75rem,13vw,7rem)] uppercase leading-[0.88] tracking-[-0.04em]">
        <span className="block">{lead}</span>
        {/* split-trail-underline draws the animated accent line (see globals.css) */}
        <span className="block pl-4 text-accent-text sm:pl-12">
          <span className="split-trail-underline">{trail}</span>
        </span>
      </h1>

      {copy ? (
        <p
          className={cn(
            "description-copy max-w-2xl text-muted",
            align === "center" && "mx-auto"
          )}
        >
          {copy}
        </p>
      ) : null}
    </div>
  );
}
