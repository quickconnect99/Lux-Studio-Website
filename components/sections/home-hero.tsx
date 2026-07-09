"use client";

import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { LinkButton } from "@/components/ui/link-button";
import { SplitHeadline } from "@/components/ui/split-headline";
import type { SiteSettings } from "@/lib/types";
import { resolveVideoSource } from "@/lib/video";

type HomeHeroProps = {
  hero: SiteSettings["hero"];
  copy: SiteSettings["copy"]["home"];
  /** OG/poster image — should be a real raster image (JPG/WebP), not SVG */
  posterSrc?: string;
};

export function HomeHero({
  hero,
  copy,
  posterSrc = "/images/demo-car-01.jpg"
}: HomeHeroProps) {
  const shouldReduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [heroRevealed, setHeroRevealed] = useState(false);
  const videoSource = resolveVideoSource(hero.videoUrl);
  const fileVideoSrc = videoSource?.kind === "file" ? videoSource.src : null;

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !fileVideoSrc || shouldReduceMotion) {
      video?.pause();
      return;
    }

    void video
      .play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch(() => {
        setIsPlaying(false);
      });
  }, [fileVideoSrc, shouldReduceMotion]);

  async function togglePlayback() {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (video.paused) {
      try {
        await video.play();
        setIsPlaying(true);
      } catch {
        // playback blocked by browser policy
      }

      return;
    }

    video.pause();
    setIsPlaying(false);
  }

  return (
    <section className="section-shell relative overflow-hidden pb-8 pt-7 sm:pb-14 sm:pt-16">
      <div className="absolute inset-x-0 top-8 -z-10 h-[500px] rounded-[3rem] bg-hero-radial blur-3xl" />
      <div className="grid gap-7 sm:gap-10 lg:items-center xl:grid-cols-[0.95fr_1.05fr]">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          onAnimationComplete={() => setHeroRevealed(true)}
          className={heroRevealed ? "group-reveal space-y-6 sm:space-y-8" : "space-y-6 sm:space-y-8"}
        >
          <p className="eyebrow">{hero.eyebrow}</p>
          <SplitHeadline
            lead={hero.headlineLead}
            trail={hero.headlineTrail}
            copy={hero.copy}
          />
          <div className="grid gap-3 sm:flex sm:flex-wrap sm:gap-4">
            <LinkButton href="/work" className="w-full sm:w-auto">{copy.heroPrimaryCta}</LinkButton>
            <LinkButton href="/contact" variant="secondary" className="w-full sm:w-auto">
              {copy.heroSecondaryCta}
            </LinkButton>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="film-frame grain relative min-h-[360px] border border-white/60 bg-panel-dark text-white shadow-halo sm:min-h-[420px] lg:min-h-[560px]"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 25%), radial-gradient(circle at 80% 0%, color-mix(in srgb, var(--accent-blue) 24%, transparent), transparent 30%), linear-gradient(180deg, rgba(15, 20, 25, 0.2), rgba(15, 20, 25, 0.88))"
            }}
          />
          <Image
            src={posterSrc}
            alt=""
            fill
            priority
            sizes="(min-width: 1280px) 52vw, 100vw"
            className="object-cover opacity-45"
          />
          {fileVideoSrc ? (
            <video
              ref={videoRef}
              autoPlay={!shouldReduceMotion}
              muted
              loop
              playsInline
              preload="metadata"
              poster={posterSrc}
              onError={() => {
                setIsPlaying(false);
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="absolute inset-0 h-full w-full object-cover opacity-60"
            >
              <source src={fileVideoSrc} />
            </video>
          ) : null}

          <div className="relative z-10 flex h-full flex-col justify-between p-5 sm:p-8">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={togglePlayback}
                disabled={!fileVideoSrc}
                aria-pressed={isPlaying}
                aria-label={
                  isPlaying ? "Pause showreel video" : "Play showreel video"
                }
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[0.62rem] tracking-[0.18em] text-white/85 backdrop-blur disabled:opacity-50"
              >
                {isPlaying ? (
                  <Pause className="h-3.5 w-3.5" />
                ) : (
                  <Play className="h-3.5 w-3.5" />
                )}
                {isPlaying ? "Pause Reel" : "Play Reel"}
              </button>
            </div>

            <div className="max-w-xl space-y-5">
              <h2 className="font-[family:var(--font-display)] text-[2.65rem] uppercase leading-[0.92] sm:text-6xl">
                {copy.videoHeadlineLead}
                <span className="block pl-5 text-accent sm:pl-10">
                  {copy.videoHeadlineTrail}
                </span>
              </h2>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
