"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import type { Project } from "@/lib/types";

type Filter = "all" | "published" | "draft" | "featured";

type Props = {
  projects: Project[];
  selectedSlug: string;
  isDirty: boolean;
  onSelect: (project: Project) => void;
  onNew: () => void;
};

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "published", label: "Live" },
  { key: "draft", label: "Draft" },
  { key: "featured", label: "★" }
];

export function ProjectSidebar({
  projects,
  selectedSlug,
  isDirty,
  onSelect,
  onNew
}: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return projects.filter((p) => {
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.carModel.toLowerCase().includes(q);
      const matchesFilter =
        filter === "all" ||
        (filter === "published" && p.published) ||
        (filter === "draft" && !p.published) ||
        (filter === "featured" && p.featured);
      return matchesSearch && matchesFilter;
    });
  }, [projects, search, filter]);

  return (
    <aside className="panel-2xl p-5 lg:col-span-2 xl:sticky xl:top-6 xl:col-span-1 xl:self-start">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-eyebrow text-muted">
          Projects{" "}
          <span className="tabular-nums">
            ({filtered.length}/{projects.length})
          </span>
        </p>
        <button
          type="button"
          onClick={onNew}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-panel hover:border-accent"
          aria-label="New project"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Search */}
      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects…"
          className="input-field pl-9 text-xs"
        />
      </div>

      {/* Filter tabs */}
      <div className="mt-2.5 flex gap-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`flex-1 rounded-full py-1.5 text-[0.62rem] uppercase tracking-eyebrow transition-colors ${
              filter === f.key
                ? "bg-foreground text-background"
                : "text-muted hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Project list */}
      <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto xl:block xl:max-h-[calc(100vh-320px)] xl:space-y-2 xl:overflow-y-auto xl:overflow-x-visible">
        {filtered.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted">
            No projects found.
          </p>
        ) : (
          filtered.map((project) => {
            const isActive = selectedSlug === project.slug;
            return (
              <button
                key={project.slug}
                type="button"
                onClick={() => onSelect(project)}
                className={`w-44 shrink-0 rounded-[1.25rem] border p-4 text-left transition-colors xl:w-full ${
                  isActive
                    ? "border-foreground bg-foreground text-background"
                    : "border-line bg-panel-secondary text-foreground hover:border-foreground/30"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[0.58rem] uppercase tracking-eyebrow opacity-70">
                    {project.business} / {project.category}
                  </p>
                  <div className="flex shrink-0 gap-1">
                    {project.featured ? (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[0.5rem] font-medium ${isActive ? "bg-white/20 text-white" : "bg-accent/15 text-accent"}`}
                      >
                        ★
                      </span>
                    ) : null}
                    {!project.published ? (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[0.5rem] uppercase tracking-wider ${isActive ? "bg-white/20 text-white/70" : "bg-muted/15 text-muted"}`}
                      >
                        Draft
                      </span>
                    ) : null}
                  </div>
                </div>
                <p className="font-[family:var(--font-display)] mt-2 text-lg uppercase leading-tight">
                  {project.title}
                </p>
                <p className="mt-1.5 text-xs uppercase tracking-meta opacity-60">
                  {project.carModel} · {project.location}
                </p>
                {isDirty && isActive ? (
                  <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-warning" />
                ) : null}
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
