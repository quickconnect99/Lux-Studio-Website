"use client";

import Image from "next/image";
import Link from "next/link";
import { startTransition, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import {
  getProjectPrimaryMetaLabel,
  projectBusinessToParam,
  projectBusinesses
} from "@/lib/project-business";
import type { Project, ProjectBusiness } from "@/lib/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 6;
const ALL = "All";

type ProjectGridProps = {
  projects: Project[];
  initialBusiness?: ProjectBusiness | null;
};

export function ProjectGrid({
  projects,
  initialBusiness = null
}: ProjectGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const availableBusinesses = useMemo(
    () =>
      projectBusinesses.filter((business) =>
        projects.some((project) => project.business === business)
      ),
    [projects]
  );
  const [activeBusiness, setActiveBusiness] = useState<
    ProjectBusiness | typeof ALL
  >(initialBusiness ?? ALL);
  const [activeCategory, setActiveCategory] = useState(ALL);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const businessFilteredProjects = useMemo(
    () =>
      activeBusiness === ALL
        ? projects
        : projects.filter((project) => project.business === activeBusiness),
    [activeBusiness, projects]
  );

  const categories = useMemo(
    () => [
      ALL,
      ...new Set(businessFilteredProjects.map((project) => project.category))
    ],
    [businessFilteredProjects]
  );

  const filteredProjects = useMemo(
    () =>
      activeCategory === ALL
        ? businessFilteredProjects
        : businessFilteredProjects.filter(
            (project) => project.category === activeCategory
          ),
    [activeCategory, businessFilteredProjects]
  );

  const visible = filteredProjects.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProjects.length;
  const remaining = filteredProjects.length - visibleCount;
  const businessFilters: Array<ProjectBusiness | typeof ALL> = [
    ALL,
    ...availableBusinesses
  ];
  const detailQuery =
    activeBusiness === ALL
      ? ""
      : `?business=${projectBusinessToParam(activeBusiness)}`;

  function syncBusinessParam(business: ProjectBusiness | typeof ALL) {
    const params = new URLSearchParams(searchParams.toString());

    if (business === ALL) {
      params.delete("business");
    } else {
      params.set("business", projectBusinessToParam(business));
    }

    const nextUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;

    startTransition(() => {
      router.replace(nextUrl, { scroll: false });
    });
  }

  function selectBusiness(business: ProjectBusiness | typeof ALL) {
    setActiveBusiness(business);
    setActiveCategory(ALL);
    setVisibleCount(PAGE_SIZE);
    syncBusinessParam(business);
  }

  function selectCategory(category: string) {
    setActiveCategory(category);
    setVisibleCount(PAGE_SIZE);
  }

  function loadMore() {
    setVisibleCount((count) => count + PAGE_SIZE);
  }

  return (
    <section className="section-shell pb-20">
      {availableBusinesses.length > 1 ? (
        <div className="flex flex-wrap gap-3 border-y border-line py-5">
          {businessFilters.map((business) => (
            <motion.button
              key={business}
              type="button"
              onClick={() => selectBusiness(business)}
              whileTap={{ scale: 0.94 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "min-h-11 rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-ui",
                "transition-colors duration-150",
                activeBusiness === business
                  ? "border-foreground bg-foreground text-background"
                  : "border-line bg-panel-secondary text-muted hover:border-accent hover:bg-panel hover:text-foreground"
              )}
            >
              {business}
            </motion.button>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3 py-5">
        {categories.map((category) => (
          <motion.button
            key={category}
            type="button"
            onClick={() => selectCategory(category)}
            whileTap={{ scale: 0.94 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "min-h-11 rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-ui",
              "transition-colors duration-150",
              activeCategory === category
                ? "border-foreground bg-foreground text-background"
                : "border-line bg-panel-secondary text-muted hover:border-accent hover:bg-panel hover:text-foreground"
            )}
          >
            {category}
          </motion.button>
        ))}
      </div>

      {filteredProjects.length === 0 ? (
        <div className="rounded-[2rem] border border-line bg-panel-secondary p-8 text-center shadow-card">
          <p className="text-xs uppercase tracking-eyebrow text-muted">
            No projects in this filter
          </p>
          <h2 className="font-[family:var(--font-display)] mt-4 text-4xl uppercase leading-none text-foreground">
            Nothing
            <span className="block pl-8 text-accent sm:pl-12">Matched Yet</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted sm:text-base">
            This business and category combination does not have published work
            yet. Switch filters or clear the business selection to browse the
            full portfolio.
          </p>
          {(activeBusiness !== ALL || activeCategory !== ALL) && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setActiveCategory(ALL);
                  selectBusiness(ALL);
                }}
                className="min-h-11 rounded-full border border-line bg-panel px-5 py-3 text-xs font-medium uppercase tracking-ui text-foreground transition-colors duration-150 hover:border-accent hover:bg-panel-secondary"
              >
                Show All Projects
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-6 pt-8 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((project, index) => (
              <motion.div
                key={project.slug}
                layout
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 18 }}
                transition={{
                  duration: 0.55,
                  delay: index < PAGE_SIZE ? index * 0.04 : 0,
                  ease: [0.22, 1, 0.36, 1]
                }}
              >
                <Link
                  href={`/work/${project.slug}${detailQuery}`}
                  className="group block overflow-hidden rounded-[2rem] border border-line bg-panel-secondary shadow-card"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={project.coverImage}
                      alt={project.title}
                      fill
                      sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                      <div className="flex items-center justify-between gap-4 text-[0.64rem] uppercase tracking-meta text-white/80">
                        <span>
                          {project.business} / {project.category}
                        </span>
                        <span>{project.year}</span>
                      </div>
                      <h3 className="font-[family:var(--font-display)] mt-4 text-3xl uppercase leading-none">
                        {project.title}
                      </h3>
                      <p className="mt-3 max-w-sm text-sm leading-7 text-white/80">
                        {project.shortDescription}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 border-t border-line p-5 sm:grid-cols-[1.1fr_1fr_auto]">
                    <div>
                      <p className="text-[0.58rem] uppercase tracking-[0.22em] text-muted">
                        {getProjectPrimaryMetaLabel(project.business)}
                      </p>
                      <p className="mt-2 text-[0.72rem] font-medium uppercase tracking-[0.12em] text-foreground">
                        {project.carModel}
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.58rem] uppercase tracking-[0.22em] text-muted">
                        Location
                      </p>
                      <p className="mt-2 text-[0.72rem] uppercase tracking-[0.12em] text-foreground">
                        {project.location}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 self-end text-[0.72rem] font-medium uppercase tracking-[0.12em] text-foreground transition-colors duration-150 group-hover:text-accent">
                      Open Project
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {hasMore && (
        <div className="mt-12 flex justify-center">
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={loadMore}
            className={cn(
              "inline-flex min-h-11 items-center gap-3 rounded-full border px-6 py-3",
              "text-xs font-medium uppercase tracking-ui",
              "border-line bg-panel-secondary text-foreground",
              "transition-colors duration-150 hover:border-accent hover:bg-panel"
            )}
          >
            Load more
            <span className="metadata-number">{remaining}</span>
          </motion.button>
        </div>
      )}
    </section>
  );
}
