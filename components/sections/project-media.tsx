import Image from "next/image";
import { EmbeddedVideoConsent } from "@/components/legal/embedded-video-consent";
import type { Project } from "@/lib/types";
import { getProjectVideoSource } from "@/lib/video";

type ProjectMediaProps = {
  project: Project;
};

export function ProjectMedia({ project }: ProjectMediaProps) {
  const videoSource = getProjectVideoSource(project);
  const isExternalEmbed =
    videoSource?.kind === "youtube" || videoSource?.kind === "vimeo";

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
          quality={90}
          className="object-cover"
        />
      )}

      {isExternalEmbed ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/70 via-black/10 to-transparent p-6 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4 text-[0.65rem] uppercase tracking-eyebrow text-white/75">
            <span>Project film / {videoSource!.label}</span>
            <span>{project.location}</span>
          </div>
        </div>
      ) : (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 via-black/10 to-transparent p-6 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4 text-[0.65rem] uppercase tracking-eyebrow text-white/75">
            <span>
              {videoSource ? `Project film / ${videoSource.label}` : "Cover still"}
            </span>
            <span>{project.location}</span>
          </div>
        </div>
      )}
    </div>
  );
}
