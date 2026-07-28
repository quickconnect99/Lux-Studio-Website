"use client";

import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Monitor,
  Pencil,
  Smartphone
} from "lucide-react";
import type {
  PreviewPage,
  PreviewWidth
} from "@/components/admin/site-settings-editor-types";
import { cn } from "@/lib/utils";

export function SiteSettingsToolbar({
  isDirty,
  page,
  previewWidth,
  onPageChange,
  onPreviewWidthChange
}: {
  isDirty: boolean;
  page: PreviewPage;
  previewWidth: PreviewWidth;
  onPageChange(page: PreviewPage): void;
  onPreviewWidthChange(width: PreviewWidth): void;
}) {
  return (
    <div className="panel-2xl flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
      <div>
        <p className="text-xs uppercase tracking-eyebrow text-muted">
          Live site editor
        </p>
        <p className="mt-1.5 flex items-center gap-2 text-sm text-muted">
          {isDirty ? (
            <>
              <AlertCircle className="h-4 w-4 text-warning" />
              <span className="text-warning">Unsaved changes</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 text-success" />
              All changes saved
            </>
          )}
        </p>
        <p className="border-accent/40 bg-accent/10 mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[0.62rem] uppercase tracking-ui text-foreground">
          <Pencil className="h-3 w-3 text-accent" />
          Green-highlighted content is directly editable
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div
          role="tablist"
          aria-label="Site settings preview page"
          className="no-scrollbar flex max-w-full overflow-x-auto rounded-full border border-line bg-panel-secondary p-1"
        >
          {(
            [
              ["general", "00 General"],
              ["home", "01 Home"],
              ["work", "02 Work"],
              ["services", "03 Services"],
              ["about", "04 About"],
              ["contact", "05 Contact"]
            ] as Array<[PreviewPage, string]>
          ).map(([previewPage, label]) => (
            <button
              key={previewPage}
              type="button"
              role="tab"
              aria-selected={page === previewPage}
              onClick={() => onPageChange(previewPage)}
              className={cn(
                "min-h-11 rounded-full px-3 py-2 text-[0.58rem] uppercase tracking-ui",
                page === previewPage
                  ? "bg-foreground text-background"
                  : "text-muted"
              )}
            >
              {label}
            </button>
          ))}
        </div>
        {page !== "general" ? (
          <div className="flex rounded-full border border-line bg-panel-secondary p-1">
            <button
              type="button"
              onClick={() => onPreviewWidthChange("desktop")}
              aria-label="Desktop preview"
              aria-pressed={previewWidth === "desktop"}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full",
                previewWidth === "desktop"
                  ? "bg-foreground text-background"
                  : "text-muted"
              )}
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onPreviewWidthChange("mobile")}
              aria-label="Mobile preview"
              aria-pressed={previewWidth === "mobile"}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full",
                previewWidth === "mobile"
                  ? "bg-foreground text-background"
                  : "text-muted"
              )}
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>
        ) : null}
        <a href="/" target="_blank" rel="noreferrer" className="control-pill">
          Live site
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
