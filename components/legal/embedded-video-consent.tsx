"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Play } from "lucide-react";
import { useState } from "react";

type EmbeddedVideoConsentProps = {
  title: string;
  providerLabel: string;
  embedSrc: string;
  externalHref: string;
  posterSrc: string;
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
      <iframe
        src={embedSrc}
        title={`${title} video`}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="absolute inset-0 h-full w-full border-0"
      />
    );
  }

  return (
    <div className="absolute inset-0">
      <Image
        src={posterSrc}
        alt={`${title} Vorschaubild`}
        fill
        sizes="(min-width: 1024px) 55vw, 100vw"
        quality={90}
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,10,0.24)_0%,rgba(5,8,10,0.82)_100%)]" />

      <div className="absolute inset-x-0 bottom-0 z-10 p-6 text-white sm:p-8">
        <div className="max-w-xl rounded-[1.75rem] border border-white/15 bg-black/70 p-5 backdrop-blur-md">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-accent">
            External video / {providerLabel}
          </p>
          <h3 className="mt-3 font-[family:var(--font-display)] text-3xl uppercase leading-none sm:text-4xl">
            Video erst nach Klick laden
          </h3>
          <p className="mt-4 max-w-lg text-sm leading-7 text-white/78">
            Erst mit dem Klick auf den Button wird eine Verbindung zu{" "}
            {providerLabel} aufgebaut. Dabei koennen personenbezogene Daten an
            den jeweiligen Anbieter uebertragen werden.
          </p>

          <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={() => setEnabled(true)}
              className="action-button"
            >
              <Play className="h-4 w-4" />
              Video laden
            </button>

            <a
              href={externalHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-ui text-white/82 transition-colors duration-150 hover:text-accent"
            >
              Direkt bei {providerLabel}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            <Link
              href="/datenschutz"
              className="text-xs uppercase tracking-ui text-white/68 transition-colors duration-150 hover:text-accent sm:basis-full"
            >
              Datenschutz ansehen
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
