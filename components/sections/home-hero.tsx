"use client";

import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { EmbeddedVideoConsent } from "@/components/legal/embedded-video-consent";
import { LinkButton } from "@/components/ui/link-button";
import { SplitHeadline } from "@/components/ui/split-headline";
import type { SiteSettings } from "@/lib/types";
import { resolveVideoSource } from "@/lib/video";

type HomeHeroProps = {
  hero: SiteSettings["hero"];
  copy: SiteSettings["copy"]["home"];
};

export function HomeHero({
  hero,
  copy
}: HomeHeroProps) {
  const shouldReduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [heroRevealed, setHeroRevealed] = useState(false);
  const videoSource = resolveVideoSource(hero.videoUrl);
  const fileVideoSrc = videoSource?.kind === "file" ? videoSource.src : null;
  const isExternalEmbed =
    videoSource?.kind === "youtube" || videoSource?.kind === "vimeo";

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

  function toggleMute() {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative min-h-[360px] overflow-hidden rounded-[1.35rem] border border-white/25 bg-black text-white shadow-halo sm:min-h-[420px] sm:rounded-[1.75rem] lg:min-h-[560px]"
        >
          {fileVideoSrc ? (
            <video
              ref={videoRef}
              muted={isMuted}
              loop
              playsInline
              preload="metadata"
              poster="/images/hero-poster.svg"
              onError={() => {
                setIsPlaying(false);
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="absolute inset-0 h-full w-full object-cover opacity-60"
            >
              <source src={fileVideoSrc} />
            </video>
          ) : isExternalEmbed && videoSource ? (
            <EmbeddedVideoConsent
              title={[copy.videoHeadlineLead, copy.videoHeadlineTrail]
                .filter(Boolean)
                .join(" ")}
              providerLabel={videoSource.label}
              embedSrc={videoSource.src}
              externalHref={videoSource.externalHref}
            />
          ) : null}

          <div className="relative z-10 flex h-full flex-col justify-between p-5 sm:p-8">
            <div className="flex justify-end gap-2">
              {fileVideoSrc ? (
                <>
                  <button
                    type="button"
                    onClick={togglePlayback}
                    aria-pressed={isPlaying}
                    aria-label={
                      isPlaying ? "Pause showreel video" : "Play showreel video"
                    }
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[0.62rem] tracking-[0.18em] text-white/85 backdrop-blur disabled:opacity-50"
                  >
                    {isPlaying ? (
                      <Pause className="h-3.5 w-3.5" />
                    ) : (
                      <Play className="h-3.5 w-3.5" />
                    )}
                    {isPlaying ? "Pause Reel" : "Play Reel"}
                  </button>
                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-pressed={!isMuted}
                    aria-label={isMuted ? "Unmute showreel video" : "Mute showreel video"}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/85 backdrop-blur"
                  >
                    {isMuted ? (
                      <VolumeX className="h-3.5 w-3.5" />
                    ) : (
                      <Volume2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </>
              ) : null}
            </div>

            <div className="max-w-xl space-y-5">
              <h2 className="font-[family-name:var(--font-display)] text-[2.65rem] uppercase leading-[0.92] sm:text-6xl">
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
