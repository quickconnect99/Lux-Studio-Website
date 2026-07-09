import {
  Camera,
  Linkedin,
  Music2,
  Play,
  Send,
  Video,
  type LucideIcon
} from "lucide-react";
import type { SocialLink } from "@/lib/types";

type SocialLinksProps = {
  links: SocialLink[];
  showLabels?: boolean;
};

function getSocialIcon(label: string): LucideIcon {
  const normalized = label.trim().toLowerCase();

  if (normalized.includes("instagram")) return Camera;
  if (normalized.includes("youtube")) return Play;
  if (normalized.includes("vimeo")) return Video;
  if (normalized.includes("linkedin")) return Linkedin;
  if (normalized.includes("tiktok")) return Music2;

  return Send;
}

export function SocialLinks({ links, showLabels = false }: SocialLinksProps) {
  if (links.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {links.map((item) => {
        const Icon = getSocialIcon(item.label);

        return (
          <a
            key={`${item.label}-${item.href}`}
            href={item.href}
            target="_blank"
            rel="noreferrer"
            aria-label={item.label}
            title={item.label}
            className="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-line bg-panel px-3 text-foreground transition-colors duration-150 hover:border-accent hover:text-accent"
          >
            <Icon className="h-4 w-4" />
            {showLabels ? (
              <span className="text-xs uppercase tracking-ui">
                {item.label}
              </span>
            ) : null}
          </a>
        );
      })}
    </div>
  );
}
