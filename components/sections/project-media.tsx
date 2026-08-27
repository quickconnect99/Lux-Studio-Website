import { AdaptiveImage as Image } from "@/components/ui/adaptive-image";
import { EmbeddedVideoConsent } from "@/components/legal/embedded-video-consent";
import type { Project } from "@/lib/types";
import { getProjectVideoSource } from "@/lib/video";

type ProjectMediaProps = {
  project: Project;
};

export function ProjectMedia({ project }: ProjectMediaProps) {
  const videoSource = getProjectVideoSource(project);

  return (
    <div className="film-frame grain relative min-h-[320px] overflow-hidden bg-panel-dark sm:min-h-[620px]">
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
          fallbackSrc="/images/hero-poster.svg"
          alt={`${project.title}, ${project.carModel || project.category} in ${project.location}`}
          fill
          preload
          sizes="(min-width: 1024px) 55vw, 100vw"
          quality={90}
          className="object-cover"
        />
      )}

      {videoSource ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/70 via-black/10 to-transparent p-4 text-white sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 text-[0.72rem] uppercase tracking-eyebrow text-white/80">
            <span>Project film / {videoSource.label}</span>
            <span>{project.location}</span>
          </div>
        </div>
      ) : (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 via-black/10 to-transparent p-4 text-white sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 text-[0.72rem] uppercase tracking-eyebrow text-white/80">
            <span>Cover still</span>
            <span>{project.location}</span>
          </div>
        </div>
      )}
    </div>
  );
}
