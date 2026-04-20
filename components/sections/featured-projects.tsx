"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { LinkButton } from "@/components/ui/link-button";
import { MetadataGrid } from "@/components/ui/metadata-grid";
import { Reveal } from "@/components/ui/reveal";
import { getProjectPrimaryMetaLabel } from "@/lib/project-business";
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
            <motion.article
              key={project.slug}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -12% 0px" }}
              transition={{
                duration: 0.65,
                delay: index * 0.03,
                ease: [0.22, 1, 0.36, 1]
              }}
              className="py-10 lg:py-14"
            >
              <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
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
                    className="font-[family:var(--font-display)] text-foreground/[0.05] pointer-events-none absolute -right-4 -top-6 select-none text-[8rem] leading-none sm:text-[11rem] lg:text-[14rem]"
                  >
                    0{index + 1}
                  </span>

                  <div className="relative space-y-7">
                    <div className="flex items-center gap-4">
                      <span className="metadata-number">0{index + 1}</span>
                      <div className="h-px flex-1 bg-line" />
                    </div>

                    <div className="space-y-4">
                      <p className="eyebrow">
                        {project.business} / {project.category}
                      </p>
                      <h2 className="font-[family:var(--font-display)] text-4xl uppercase leading-[0.9] tracking-[-0.05em] text-foreground sm:text-5xl lg:text-7xl">
                        {project.title.split(" ")[0]}
                        <span className="block pl-8 text-accent sm:pl-14">
                          {project.title.split(" ").slice(1).join(" ")}
                        </span>
                      </h2>
                      <p className="max-w-xl text-base leading-8 text-muted sm:text-lg">
                        {project.fullDescription}
                      </p>
                    </div>

                    <MetadataGrid
                      items={[
                        {
                          label: getProjectPrimaryMetaLabel(project.business),
                          value: project.carModel
                        },
                        { label: "Location", value: project.location },
                        { label: "Year", value: String(project.year) }
                      ]}
                      className="max-w-xl"
                    />

                    <div className="flex flex-wrap items-center gap-4">
                      <LinkButton href={`/work/${project.slug}`}>
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
                  <div className="film-frame grain relative aspect-[4/5] overflow-hidden bg-panel-dark">
                    <Image
                      src={project.coverImage}
                      alt={project.title}
                      fill
                      priority={index === 0}
                      sizes="(min-width: 1024px) 52vw, 100vw"
                      className="object-cover"
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent p-6 text-white">
                      <div className="flex items-center justify-between gap-4 text-[0.65rem] uppercase tracking-meta text-white/75">
                        <span>Selected campaign</span>
                        <span>{project.location}</span>
                      </div>
                      <p className="mt-4 max-w-md text-sm leading-7 text-white/80">
                        {project.shortDescription}
                      </p>
                    </div>
                  </div>
                </Reveal>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
