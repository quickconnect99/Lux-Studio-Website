"use client";

import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { m, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { EmbeddedVideoConsent } from "@/components/legal/embedded-video-consent";
import { LinkButton } from "@/components/ui/link-button";
import { motionDuration, motionEase } from "@/lib/motion";
import { SplitHeadline } from "@/components/ui/split-headline";
import type { SiteSettings } from "@/lib/types";
import { resolveVideoSource } from "@/lib/video";

type HomeHeroProps = {
  hero: SiteSettings["hero"];
  copy: SiteSettings["copy"]["home"];
};

export function HomeHero({ hero, copy }: HomeHeroProps) {
  const shouldReduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVideoVisibleRef = useRef(false);
  const manuallyPausedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [heroRevealed, setHeroRevealed] = useState(false);
  const videoSource = resolveVideoSource(hero.videoUrl);
  const fileVideoSrc = videoSource?.kind === "file" ? videoSource.src : null;
  const isExternalEmbed =
    videoSource?.kind === "youtube" || videoSource?.kind === "vimeo";

  useEffect(() => {
    const video = videoRef.current;
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean };
      }
    ).connection;

    if (!video || !fileVideoSrc) {
      video?.pause();
      return;
    }

    let disposed = false;
    manuallyPausedRef.current = false;

    function canAutoPlay() {
      return (
        isVideoVisibleRef.current &&
        document.visibilityState === "visible" &&
        !shouldReduceMotion &&
        !connection?.saveData &&
        !manuallyPausedRef.current
      );
    }

    const syncPlayback = () => {
      if (!canAutoPlay()) {
        video.pause();
        setIsPlaying(false);
        return;
      }

      void video
        .play()
        .then(() => {
          if (disposed || !canAutoPlay()) {
            video.pause();
            return;
          }

          setIsPlaying(true);
        })
        .catch(() => {
          if (!disposed) setIsPlaying(false);
        });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVideoVisibleRef.current = Boolean(
          entry?.isIntersecting && entry.intersectionRatio >= 0.35
        );
        syncPlayback();
      },
      { threshold: [0, 0.35] }
    );

    function handleVisibilityChange() {
      syncPlayback();
    }

    observer.observe(video);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      disposed = true;
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      video.pause();
      isVideoVisibleRef.current = false;
    };
  }, [fileVideoSrc, shouldReduceMotion]);

  async function togglePlayback() {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (video.paused) {
      manuallyPausedRef.current = false;

      try {
        await video.play();
        setIsPlaying(true);
      } catch {
        // playback blocked by browser policy
      }

      return;
    }

    manuallyPausedRef.current = true;
    video.pause();
    setIsPlaying(false);
  }

  async function toggleMute() {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (video.muted) {
      video.volume = 1;
      video.defaultMuted = false;
      video.muted = false;
      setIsMuted(false);
      manuallyPausedRef.current = false;

      try {
        await video.play();
        setIsPlaying(true);
      } catch {
        video.muted = true;
        setIsMuted(true);
      }

      return;
    }

    video.muted = true;
    setIsMuted(true);
  }

  return (
    <section className="section-shell relative overflow-hidden pb-8 pt-7 sm:pb-14 sm:pt-16">
      <div
        data-home-hero-atmosphere
        className="absolute inset-x-0 top-8 -z-10 h-[500px] rounded-[3rem] bg-hero-radial blur-3xl"
      />
      <div className="grid gap-7 sm:gap-10 lg:items-center xl:grid-cols-[0.95fr_1.05fr]">
        <m.div
          initial={{ opacity: 1, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: motionDuration.hero, ease: motionEase }}
          onAnimationComplete={() => setHeroRevealed(true)}
          data-home-hero-copy
          className={
            heroRevealed
              ? "group-reveal space-y-6 sm:space-y-8"
              : "space-y-6 sm:space-y-8"
          }
        >
          <p className="eyebrow">{hero.eyebrow}</p>
          <SplitHeadline
            lead={hero.headlineLead}
            trail={hero.headlineTrail}
            copy={hero.copy}
          />
          <div className="grid gap-3 sm:flex sm:flex-wrap sm:gap-4">
            <LinkButton href="/work" className="w-full sm:w-auto">
              {copy.heroPrimaryCta}
            </LinkButton>
            <LinkButton
              href="/contact"
              variant="secondary"
              className="w-full sm:w-auto"
            >
              {copy.heroSecondaryCta}
            </LinkButton>
          </div>
        </m.div>

        <m.div
          initial={{ opacity: 1, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: motionDuration.hero,
            delay: 0.08,
            ease: motionEase
          }}
          className="relative min-h-[360px] overflow-hidden rounded-[1.35rem] border border-white/25 bg-black text-white shadow-halo sm:min-h-[420px] sm:rounded-[1.75rem] lg:min-h-[560px]"
        >
          {fileVideoSrc ? (
            <video
              ref={videoRef}
              data-hero-reel
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
              onLoadedMetadata={(event) => {
                event.currentTarget.volume = 1;
              }}
              onVolumeChange={(event) => {
                setIsMuted(event.currentTarget.muted);
              }}
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

          {!isExternalEmbed ? (
            <div className="relative z-10 flex h-full flex-col justify-between p-5 sm:p-8">
              <div className="flex justify-end gap-2">
                {fileVideoSrc ? (
                  <>
                    <button
                      type="button"
                      onClick={togglePlayback}
                      aria-pressed={isPlaying}
                      aria-label={
                        isPlaying
                          ? "Pause showreel video"
                          : "Play showreel video"
                      }
                      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[0.62rem] tracking-[0.18em] text-white/85 backdrop-blur disabled:opacity-50"
                    >
                      {isPlaying ? (
                        <Pause className="h-3.5 w-3.5" />
                      ) : (
                        <Play className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => void toggleMute()}
                      aria-pressed={!isMuted}
                      aria-label={
                        isMuted
                          ? "Turn hero reel sound on"
                          : "Turn hero reel sound off"
                      }
                      className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[0.62rem] tracking-[0.14em] text-white/85 backdrop-blur"
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
          ) : null}
        </m.div>
      </div>
    </section>
  );
}
