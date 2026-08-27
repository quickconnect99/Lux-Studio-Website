import { AdaptiveImage as Image } from "@/components/ui/adaptive-image";
import { LinkButton } from "@/components/ui/link-button";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/types";

type FeaturedProjectsProps = {
  projects: Project[];
};

export function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  if (projects.length === 0) return null;

  return (
    <section className="section-space-tight pt-0">
      <div className="section-shell">
        <div className="divide-y divide-line">
          {projects.map((project, index) => (
            <article key={project.slug} className="py-8 sm:py-10 lg:py-14">
              <div className="grid items-center gap-6 sm:gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
                <Reveal
                  variant="default"
                  direction={index % 2 === 0 ? "left" : "right"}
                  className={cn(
                    "relative min-w-0 overflow-hidden",
                    index % 2 === 0 ? "order-2 lg:order-1" : "order-2"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-2 -top-3 select-none font-[family-name:var(--font-display)] text-[6rem] leading-none text-foreground opacity-5 sm:-right-4 sm:-top-6 sm:text-[11rem] lg:text-[14rem]"
                  >
                    0{index + 1}
                  </span>

                  <div className="relative space-y-5 sm:space-y-7">
                    <div className="flex items-center gap-4">
                      <span className="metadata-number">0{index + 1}</span>
                      <div className="h-px flex-1 bg-line" />
                    </div>

                    <div className="space-y-4">
                      <p className="eyebrow">
                        {project.business} / {project.category}
                      </p>
                      <h2 className="font-[family-name:var(--font-display)] text-[2.5rem] uppercase leading-[0.9] tracking-[-0.05em] text-foreground sm:text-5xl lg:text-7xl">
                        {project.title.split(" ")[0]}
                        <span className="block pl-5 text-accent-text sm:pl-14">
                          {project.title.split(" ").slice(1).join(" ")}
                        </span>
                      </h2>
                      <p className="description-copy-compact max-w-xl text-muted">
                        {project.shortDescription}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-4">
                      <LinkButton
                        href={`/work/${project.slug}`}
                        className="w-full sm:w-auto"
                      >
                        Open Project
                      </LinkButton>
                      <span className="text-[0.65rem] uppercase tracking-meta text-muted">
                        Featured project {index + 1} / {projects.length}
                      </span>
                    </div>
                  </div>
                </Reveal>

                <Reveal
                  delay={0.05}
                  direction={index % 2 === 0 ? "right" : "left"}
                  className={cn(
                    index % 2 === 0 ? "order-1 lg:order-2" : "order-1"
                  )}
                >
                  <div className="film-frame grain relative aspect-[4/3] overflow-hidden bg-panel-dark sm:aspect-[4/5]">
                    <Image
                      src={project.coverImage}
                      fallbackSrc="/images/hero-poster.svg"
                      alt={`${project.title}, ${project.carModel || project.category} in ${project.location}`}
                      fill
                      sizes="(min-width: 1024px) 52vw, 100vw"
                      className="object-cover"
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent p-4 text-white sm:p-6">
                      <div className="flex items-center justify-between gap-4 text-[0.65rem] uppercase tracking-meta text-white/75">
                        <span>{project.carModel || project.category}</span>
                        <span>{project.location}</span>
                      </div>
                    </div>
                  </div>
                </Reveal>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
