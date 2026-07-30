"use client";

import { ResilientImage as Image } from "@/components/ui/resilient-image";
import { useId, useMemo, useState } from "react";
import { Check, ChevronDown, Plus, Search } from "lucide-react";
import {
  buildFrameItems,
  serializeFrameItem,
  type FrameItem
} from "@/lib/project-images";

export type AvailableProjectFrame = FrameItem & {
  href: string;
  projectTitle: string;
};

export function getFrameKey(frame: FrameItem) {
  return `${frame.image}::${frame.href ?? ""}`;
}

export function hydrateFrameItems(
  entries: string[],
  availableFrames: AvailableProjectFrame[]
) {
  return buildFrameItems({
    selectedFrames: entries,
    fallbackImages: [],
    galleryImages: []
  }).map((frame) => {
    const source =
      availableFrames.find(
        (available) =>
          available.image === frame.image &&
          (!frame.href || available.href === frame.href)
      ) ?? availableFrames.find((available) => available.image === frame.image);

    return {
      ...source,
      ...frame,
      href: frame.href ?? source?.href,
      alt: source?.alt,
      projectTitle: source?.projectTitle
    };
  });
}

export function reorderFrameItems(images: string[], currentItems: FrameItem[]) {
  const remaining = [...currentItems];

  return images.map((image) => {
    const matchIndex = remaining.findIndex((item) => item.image === image);
    const match =
      matchIndex >= 0 ? remaining.splice(matchIndex, 1)[0] : { image };
    return serializeFrameItem(match);
  });
}

function canOptimizeFrameImage(source: string) {
  if (source.startsWith("/")) return true;

  try {
    const configuredHost = process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : null;
    return Boolean(
      configuredHost && new URL(source).hostname === configuredHost
    );
  } catch {
    return false;
  }
}

export function ProjectFrameLibrary({
  frames,
  selectedItems,
  onToggle,
  emptyCopy
}: {
  frames: AvailableProjectFrame[];
  selectedItems: FrameItem[];
  onToggle: (frame: AvailableProjectFrame) => void;
  emptyCopy: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(12);
  const contentId = useId();
  const projectTitles = useMemo(
    () =>
      Array.from(new Set(frames.map((frame) => frame.projectTitle))).sort(
        (a, b) => a.localeCompare(b)
      ),
    [frames]
  );
  const filteredFrames = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return frames.filter((frame) => {
      const matchesProject =
        projectFilter === "all" || frame.projectTitle === projectFilter;
      const matchesQuery =
        !normalizedQuery ||
        frame.projectTitle.toLowerCase().includes(normalizedQuery) ||
        frame.alt?.toLowerCase().includes(normalizedQuery);

      return matchesProject && matchesQuery;
    });
  }, [frames, projectFilter, searchQuery]);
  const visibleFrames = filteredFrames.slice(0, visibleCount);

  return (
    <div className="mt-7 border-t border-line pt-6">
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={contentId}
        data-project-frame-library-toggle
        onClick={() => setIsExpanded((current) => !current)}
        className="flex min-h-11 w-full items-center justify-between gap-4 rounded-[1.25rem] border border-line bg-panel-secondary px-4 py-3 text-left transition-colors hover:border-accent hover:bg-panel"
      >
        <span>
          <span className="block text-[0.62rem] uppercase tracking-eyebrow text-muted">
            Published project image library
          </span>
          <span className="mt-1 block text-xs text-muted">
            {selectedItems.length} selected · {frames.length} available
          </span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-2 text-xs font-medium uppercase tracking-ui text-foreground">
          {isExpanded ? "Hide library" : "Show library"}
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      {isExpanded ? (
        <div id={contentId} data-project-frame-library-content className="mt-4">
          {frames.length === 0 ? (
            <p className="rounded-[1.25rem] border border-line bg-panel-secondary p-4 text-xs leading-6 text-muted">
              {emptyCopy}
            </p>
          ) : (
            <>
              <div className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_14rem]">
                <label className="relative">
                  <span className="sr-only">Search published images</span>
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => {
                      setSearchQuery(event.target.value);
                      setVisibleCount(12);
                    }}
                    className="input-field pl-11"
                    placeholder="Search by project"
                  />
                </label>
                <label>
                  <span className="sr-only">Filter by project</span>
                  <select
                    value={projectFilter}
                    onChange={(event) => {
                      setProjectFilter(event.target.value);
                      setVisibleCount(12);
                    }}
                    className="input-field"
                  >
                    <option value="all">All projects</option>
                    {projectTitles.map((title) => (
                      <option key={title} value={title}>
                        {title}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {filteredFrames.length === 0 ? (
                <p className="rounded-[1.25rem] border border-line bg-panel-secondary p-4 text-xs leading-6 text-muted">
                  No published images match these filters.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {visibleFrames.map((frame) => {
                    const selected = selectedItems.some(
                      (item) =>
                        getFrameKey(item) === getFrameKey(frame) ||
                        (!item.href && item.image === frame.image)
                    );

                    return (
                      <button
                        key={getFrameKey(frame)}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => onToggle(frame)}
                        className={`group relative overflow-hidden rounded-[1.25rem] border text-left transition-colors ${
                          selected
                            ? "bg-accent/10 border-accent"
                            : "border-line bg-panel-secondary hover:border-accent"
                        }`}
                      >
                        <div className="relative aspect-[4/3] overflow-hidden bg-panel-dark">
                          <Image
                            src={frame.image}
                            alt=""
                            fill
                            sizes="(min-width: 1280px) 260px, (min-width: 640px) 40vw, 80vw"
                            unoptimized={!canOptimizeFrameImage(frame.image)}
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                          <span
                            className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur ${
                              selected
                                ? "border-accent bg-accent text-accent-contrast"
                                : "border-white/30 bg-black/35 text-white"
                            }`}
                          >
                            {selected ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                          </span>
                        </div>
                        <span className="block px-4 py-3 text-[0.62rem] uppercase tracking-meta text-muted">
                          {frame.projectTitle}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              {visibleFrames.length < filteredFrames.length ? (
                <button
                  type="button"
                  onClick={() => setVisibleCount((count) => count + 12)}
                  className="control-pill mt-4"
                >
                  Show 12 more
                  <span className="text-accent-text">
                    {filteredFrames.length - visibleFrames.length}
                  </span>
                </button>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
