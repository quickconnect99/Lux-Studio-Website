"use client";

import { Pause, Play } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { LinkButton } from "@/components/ui/link-button";
import { SplitHeadline } from "@/components/ui/split-headline";
import type { SiteSettings } from "@/lib/types";

type HomeHeroProps = {
  hero: SiteSettings["hero"];
  /** OG/poster image — should be a real raster image (JPG/WebP), not SVG */
  posterSrc?: string;
};

export function HomeHero({
  hero,
  posterSrc = "/images/demo-car-01.jpg"
}: HomeHeroProps) {
  const shouldReduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [heroRevealed, setHeroRevealed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || shouldReduceMotion) {
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
  }, [shouldReduceMotion]);

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
    <section className="section-shell relative overflow-hidden pb-10 pt-12 sm:pb-14 sm:pt-16">
      <div className="absolute inset-x-0 top-8 -z-10 h-[500px] rounded-[3rem] bg-hero-radial blur-3xl" />
      <div className="grid gap-10 lg:items-center xl:grid-cols-[0.95fr_1.05fr]">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          onAnimationComplete={() => setHeroRevealed(true)}
          className={heroRevealed ? "group-reveal space-y-8" : "space-y-8"}
        >
          <p className="eyebrow">{hero.eyebrow}</p>
          <SplitHeadline
            lead={hero.headlineLead}
            trail={hero.headlineTrail}
            copy={hero.copy}
          />
          <div className="flex flex-wrap gap-4">
            <LinkButton href="/work">View Portfolio</LinkButton>
            <LinkButton href="/contact" variant="secondary">
              Start An Inquiry
            </LinkButton>
          </div>

          <div className="grid gap-5 border-t border-line pt-7 sm:grid-cols-3">
            {[
              [
                "Launch-ready films",
                "Hero edits with paid, web, social, and booking cutdowns."
              ],
              [
                "Visual systems",
                "Stills, grids, and motion assets that feel aligned."
              ],
              [
                "Atmosphere control",
                "Motion crafted for products, places, and premium arrivals."
              ]
            ].map(([title, copy]) => (
              <div key={title} className="space-y-2">
                <p className="text-sm font-medium uppercase tracking-[0.16em] text-foreground">
                  {title}
                </p>
                <p className="text-sm leading-7 text-muted">{copy}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="film-frame grain relative min-h-[300px] border border-white/60 bg-panel-dark text-white shadow-halo sm:min-h-[420px] lg:min-h-[560px]"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 25%), radial-gradient(circle at 80% 0%, color-mix(in srgb, var(--accent-blue) 24%, transparent), transparent 30%), linear-gradient(180deg, rgba(15, 20, 25, 0.2), rgba(15, 20, 25, 0.88))"
            }}
          />
          <video
            ref={videoRef}
            autoPlay={!shouldReduceMotion}
            muted
            loop
            playsInline
            preload="none"
            poster={posterSrc}
            onError={() => {
              setIsPlaying(false);
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          >
            <source src={hero.videoUrl} type="video/mp4" />
          </video>

          <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-8">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={togglePlayback}
                aria-pressed={isPlaying}
                aria-label={
                  isPlaying ? "Pause showreel video" : "Play showreel video"
                }
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[0.62rem] tracking-[0.18em] text-white/85 backdrop-blur"
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
              <h2 className="font-[family:var(--font-display)] text-4xl uppercase leading-none sm:text-6xl">
                Built
                <span className="block pl-10 text-accent">To Be Seen</span>
              </h2>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
