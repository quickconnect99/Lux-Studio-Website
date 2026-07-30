"use client";

import { ResilientImage as Image } from "@/components/ui/resilient-image";
import Link from "next/link";
import { startTransition, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, m } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import {
  getProjectPrimaryMetaLabel,
  projectBusinessToParam
} from "@/lib/project-business";
import type { Project, ProjectBusiness } from "@/lib/types";
import { motionDuration, motionEase } from "@/lib/motion";
import { cn } from "@/lib/utils";

const ALL = "All";

function normalizeFilterValue(value: string) {
  return value.trim().toLowerCase();
}

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
      Array.from(new Set(projects.map((project) => project.business))).filter(
        Boolean
      ),
    [projects]
  );
  const resolvedInitialBusiness = useMemo(() => {
    if (!initialBusiness) {
      return null;
    }

    return (
      availableBusinesses.find(
        (business) =>
          normalizeFilterValue(business) ===
          normalizeFilterValue(initialBusiness)
      ) ?? null
    );
  }, [availableBusinesses, initialBusiness]);
  const [activeBusiness, setActiveBusiness] = useState<
    ProjectBusiness | typeof ALL
  >(resolvedInitialBusiness ?? ALL);
  const [activeCategory, setActiveCategory] = useState(ALL);
  const [previousInitialBusiness, setPreviousInitialBusiness] = useState(
    resolvedInitialBusiness
  );

  if (previousInitialBusiness !== resolvedInitialBusiness) {
    setPreviousInitialBusiness(resolvedInitialBusiness);
    setActiveBusiness(resolvedInitialBusiness ?? ALL);
    setActiveCategory(ALL);
  }

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
    syncBusinessParam(business);
  }

  function selectCategory(category: string) {
    setActiveCategory(category);
  }

  return (
    <section className="section-shell pb-14 sm:pb-20">
      {availableBusinesses.length > 1 ? (
        <div className="mobile-scroll-affordance no-scrollbar -mx-4 flex gap-2 overflow-x-auto border-y border-line px-4 py-4 sm:mx-0 sm:flex-wrap sm:gap-3 sm:px-0 sm:py-5">
          {businessFilters.map((business) => (
            <m.button
              key={business}
              type="button"
              aria-pressed={activeBusiness === business}
              onClick={() => selectBusiness(business)}
              whileTap={{ scale: 0.94 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "min-h-11 shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-ui",
                "transition-colors duration-150",
                activeBusiness === business
                  ? "border-foreground bg-foreground text-background"
                  : "border-line bg-panel-secondary text-muted hover:border-accent hover:bg-panel hover:text-foreground"
              )}
            >
              {business}
            </m.button>
          ))}
        </div>
      ) : null}

      <div className="mobile-scroll-affordance no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-4 sm:mx-0 sm:flex-wrap sm:gap-3 sm:px-0 sm:py-5">
        {categories.map((category) => (
          <m.button
            key={category}
            type="button"
            aria-pressed={activeCategory === category}
            onClick={() => selectCategory(category)}
            whileTap={{ scale: 0.94 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "min-h-11 shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-ui",
              "transition-colors duration-150",
              activeCategory === category
                ? "border-foreground bg-foreground text-background"
                : "border-line bg-panel-secondary text-muted hover:border-accent hover:bg-panel hover:text-foreground"
            )}
          >
            {category}
          </m.button>
        ))}
      </div>

      <p
        className="border-t border-line py-3 text-[0.68rem] font-medium uppercase tracking-meta text-muted sm:py-4"
        role="status"
        aria-live="polite"
        data-work-result-status
      >
        Showing {filteredProjects.length} projects
        {activeBusiness === ALL ? "" : ` for ${activeBusiness}`}
        {activeCategory === ALL ? "" : ` in ${activeCategory}`}.
      </p>

      {filteredProjects.length === 0 ? (
        <div className="rounded-[2rem] border border-line bg-panel-secondary p-8 text-center shadow-card">
          <p className="text-xs uppercase tracking-eyebrow text-muted">
            No selected work here yet
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl uppercase leading-none text-foreground">
            More
            <span className="block pl-8 text-accent-text sm:pl-12">
              Coming Soon
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted sm:text-base">
            This selection is still being curated. Explore another category or
            return to the full portfolio.
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
                View Full Portfolio
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-5 pt-5 sm:pt-8 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <m.div
                key={project.slug}
                layout
                initial={{ opacity: 1, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 18 }}
                transition={{
                  duration: motionDuration.state,
                  delay: index < 6 ? index * 0.025 : 0,
                  ease: motionEase
                }}
                className="[contain-intrinsic-block-size:600px] [content-visibility:auto]"
              >
                <Link
                  href={`/work/${project.slug}${detailQuery}`}
                  data-work-project={project.slug}
                  className="group block overflow-hidden rounded-[1.5rem] border border-line bg-panel-secondary shadow-card sm:rounded-[2rem]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[4/5]">
                    <Image
                      src={project.coverImage}
                      alt={project.title}
                      fill
                      preload={index === 0}
                      sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-6">
                      <div className="flex items-center justify-between gap-4 text-[0.64rem] uppercase tracking-meta text-white/80">
                        <span>
                          {project.business} / {project.category}
                        </span>
                        <span>{project.year}</span>
                      </div>
                      <h3 className="mt-3 font-[family-name:var(--font-display)] text-[2rem] uppercase leading-none sm:mt-4 sm:text-3xl">
                        {project.title}
                      </h3>
                      <p className="description-copy-compact mt-2 line-clamp-2 max-w-sm text-white/80 sm:mt-3 sm:line-clamp-none">
                        {project.shortDescription}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-line p-4 sm:grid-cols-[1.1fr_1fr_1fr_auto] sm:p-5">
                    <div>
                      <p className="text-[0.58rem] uppercase tracking-[0.22em] text-muted">
                        {getProjectPrimaryMetaLabel(project.business)}
                      </p>
                      <p className="mt-2 text-[0.72rem] font-medium uppercase tracking-[0.12em] text-foreground">
                        {project.carModel || project.category}
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.58rem] uppercase tracking-[0.22em] text-muted">
                        Category
                      </p>
                      <p className="mt-2 text-[0.72rem] font-medium uppercase tracking-[0.12em] text-foreground">
                        {project.category}
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
                    <span className="col-span-2 inline-flex items-center justify-between gap-1.5 border-t border-line pt-3 text-[0.72rem] font-medium uppercase tracking-[0.12em] text-foreground transition-colors duration-150 group-hover:text-accent-text sm:col-span-1 sm:justify-start sm:border-0 sm:pt-0">
                      Open Project
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </m.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
