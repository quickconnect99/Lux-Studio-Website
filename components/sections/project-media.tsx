import Image from "next/image";
import { EmbeddedVideoConsent } from "@/components/legal/embedded-video-consent";
import type { Project } from "@/lib/types";
import { getProjectVideoSource } from "@/lib/video";

type ProjectMediaProps = {
  project: Project;
};

export function ProjectMedia({ project }: ProjectMediaProps) {
  const videoSource = getProjectVideoSource(project);
  const showMetaOverlay = !videoSource || videoSource.kind === "file";
  const overlayPaddingClass = videoSource ? "p-6 pb-20 sm:pb-24" : "p-6";

  return (
    <div className="film-frame grain relative min-h-[420px] overflow-hidden bg-panel-dark sm:min-h-[620px]">
      {videoSource ? (
        videoSource.kind === "file" ? (
          <video
            controls
            playsInline
            preload="metadata"
            poster={project.coverImage}
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src={videoSource.src} />
          </video>
        ) : (
          <EmbeddedVideoConsent
            title={project.title}
            providerLabel={videoSource.label}
            embedSrc={videoSource.src}
            externalHref={videoSource.externalHref}
            posterSrc={project.coverImage}
          />
        )
      ) : (
        <Image
          src={project.coverImage}
          alt={project.title}
          fill
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="object-cover"
        />
      )}

      {showMetaOverlay ? (
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 via-black/10 to-transparent text-white ${overlayPaddingClass}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 text-[0.65rem] uppercase tracking-eyebrow text-white/75">
            <span>
              {videoSource
                ? `Project film / ${videoSource.label}`
                : "Cover still"}
            </span>
            <span>{project.location}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
