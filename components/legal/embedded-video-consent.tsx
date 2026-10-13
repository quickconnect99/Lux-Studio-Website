"use client";

import { ResilientImage as Image } from "@/components/ui/resilient-image";
import Link from "next/link";
import { ExternalLink, Play } from "lucide-react";
import { useState } from "react";

type EmbeddedVideoConsentProps = {
  title: string;
  providerLabel: string;
  embedSrc: string;
  externalHref: string;
  posterSrc?: string;
};

export function EmbeddedVideoConsent({
  title,
  providerLabel,
  embedSrc,
  externalHref,
  posterSrc
}: EmbeddedVideoConsentProps) {
  const [enabled, setEnabled] = useState(false);

  if (enabled) {
    return (
      <div className="relative aspect-video min-h-[240px] sm:min-h-[420px]">
        <iframe
          src={embedSrc}
          title={`${title} video`}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[320px] items-end sm:min-h-[420px]">
      {posterSrc ? (
        <Image
          src={posterSrc}
          alt={`${title} poster image`}
          fill
          sizes="(min-width: 1024px) 55vw, 100vw"
          quality={90}
          className="object-cover"
        />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,10,0.24)_0%,rgba(5,8,10,0.82)_100%)]" />

      <div className="relative z-10 w-full px-4 pb-4 pt-16 text-white sm:p-8 sm:pt-20">
        <div className="max-w-xl rounded-[1.75rem] border border-white/15 bg-black/70 p-5 backdrop-blur-md">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-accent">
            External video / {providerLabel}
          </p>
          <h3 className="mt-3 font-[family-name:var(--font-display)] text-3xl uppercase leading-none sm:text-4xl">
            Load Video Only After Click
          </h3>
          <p className="text-white/78 mt-4 max-w-lg text-sm leading-7">
            Clicking the button opens a connection to {providerLabel}. Personal
            data may be transferred to the provider during that request.
          </p>

          <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={() => setEnabled(true)}
              className="action-button"
            >
              <Play className="h-4 w-4" />
              Load video
            </button>

            <a
              href={externalHref}
              target="_blank"
              rel="noreferrer"
              className="text-white/82 inline-flex min-h-11 items-center gap-2 text-xs uppercase tracking-ui transition-colors duration-150 hover:text-accent"
            >
              Watch on {providerLabel}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            <Link
              href="/datenschutz"
              className="inline-flex min-h-11 items-center text-xs uppercase tracking-ui text-white/80 transition-colors duration-150 hover:text-accent sm:basis-full"
            >
              View privacy policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
