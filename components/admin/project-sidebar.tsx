"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Plus, Search } from "lucide-react";
import type { AdminProjectListItem } from "@/lib/admin-types";

type Filter = "all" | "published" | "draft" | "featured";

type Props = {
  templates: AdminProjectListItem[];
  projects: AdminProjectListItem[];
  selectedProjectKey: string;
  isDirty: boolean;
  onSelect: (project: AdminProjectListItem) => void;
  onNew: () => void;
};

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "published", label: "Live" },
  { key: "draft", label: "Draft" },
  { key: "featured", label: "★" }
];

export function ProjectSidebar({
  templates,
  projects,
  selectedProjectKey,
  isDirty,
  onSelect,
  onNew
}: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [templatesCollapsed, setTemplatesCollapsed] = useState(true);

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
  const showTemplates = filter === "all" && templates.length > 0;

  function renderProjectButton(project: AdminProjectListItem) {
    const isActive = selectedProjectKey === project.adminKey;

    return (
      <button
        key={project.adminKey}
        type="button"
        onClick={() => onSelect(project)}
        className={`w-full rounded-[1.25rem] border p-4 text-left transition-colors ${
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
            {project.isTemplate ? (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[0.5rem] uppercase tracking-wider ${
                  isActive ? "bg-white/20 text-white" : "bg-accent/15 text-accent"
                }`}
              >
                Template
              </span>
            ) : null}
            {project.featured ? (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[0.5rem] font-medium ${
                  isActive ? "bg-white/20 text-white" : "bg-accent/15 text-accent"
                }`}
              >
                ★
              </span>
            ) : null}
            {!project.published && !project.isTemplate ? (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[0.5rem] uppercase tracking-wider ${
                  isActive ? "bg-white/20 text-white/70" : "bg-muted/15 text-muted"
                }`}
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
        {project.isTemplate ? (
          <p className="mt-2 text-[0.62rem] leading-5 opacity-65">
            Saving creates a new project. The template stays unchanged.
          </p>
        ) : null}
        {isDirty && isActive ? (
          <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-warning" />
        ) : null}
      </button>
    );
  }

  return (
    <aside className="panel-2xl p-5 lg:col-span-2 xl:sticky xl:top-6 xl:col-span-1 xl:flex xl:max-h-[calc(100vh-3rem)] xl:flex-col xl:self-start xl:overflow-hidden">
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

      <div className="mt-4 flex flex-col gap-3 xl:min-h-0 xl:flex-1">
        {showTemplates ? (
          <div className="rounded-[1.25rem] border border-line bg-panel-secondary/45 p-2">
            <button
              type="button"
              onClick={() => setTemplatesCollapsed((current) => !current)}
              className="flex w-full items-center justify-between gap-3 rounded-[1rem] px-2 py-2 text-left transition-colors hover:bg-panel-secondary"
              aria-expanded={!templatesCollapsed}
              aria-controls="admin-template-list"
            >
              <div>
                <p className="text-[0.58rem] uppercase tracking-[0.28em] text-muted">
                  Templates ({templates.length})
                </p>
                <p className="mt-1 text-[0.72rem] leading-5 text-muted">
                  Starter projects for new entries.
                </p>
              </div>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line bg-panel text-muted">
                {templatesCollapsed ? (
                  <ChevronRight className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </span>
            </button>

            {!templatesCollapsed ? (
              <div
                id="admin-template-list"
                className="mt-2 max-h-64 space-y-2 overflow-y-auto pr-1"
              >
                {templates.map(renderProjectButton)}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-col xl:min-h-0 xl:flex-1">
          <p className="text-[0.58rem] uppercase tracking-[0.28em] text-muted">
            Saved projects
          </p>
          <div className="mt-2 max-h-[24rem] space-y-2 overflow-y-auto pr-1 xl:min-h-0 xl:max-h-none xl:flex-1">
            {filtered.length === 0 ? (
              <p className="rounded-[1.25rem] border border-line bg-panel-secondary px-4 py-6 text-center text-xs text-muted">
                No saved projects found.
              </p>
            ) : (
              filtered.map(renderProjectButton)
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
