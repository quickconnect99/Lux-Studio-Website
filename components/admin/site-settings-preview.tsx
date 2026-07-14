"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { CheckCircle2, RefreshCw, Save } from "lucide-react";
import type {
  PreviewPage,
  PreviewWidth,
  SiteSettingsEditorProps
} from "@/components/admin/site-settings-editor-types";
import { SiteSettingsInspector } from "@/components/admin/site-settings-inspector";
import { SiteSettingsPreviewFooter } from "@/components/admin/site-settings-preview-footer";
import { SiteSettingsPreviewHeader } from "@/components/admin/site-settings-preview-header";
import { SiteSettingsToolbar } from "@/components/admin/site-settings-toolbar";
import { cn } from "@/lib/utils";

function PreviewLoading() {
  return (
    <div
      className="flex min-h-[32rem] items-center justify-center px-6 py-16"
      role="status"
      aria-live="polite"
    >
      <span className="inline-flex items-center gap-3 text-xs uppercase tracking-eyebrow text-muted">
        <RefreshCw className="h-4 w-4 animate-spin text-accent" />
        Loading preview
      </span>
    </div>
  );
}

const SiteSettingsHomePreview = dynamic(
  () =>
    import("@/components/admin/site-settings-home-preview").then(
      (module) => module.SiteSettingsHomePreview
    ),
  { loading: PreviewLoading, ssr: false }
);

const SiteSettingsWorkPreview = dynamic(
  () =>
    import("@/components/admin/site-settings-work-preview").then(
      (module) => module.SiteSettingsWorkPreview
    ),
  { loading: PreviewLoading, ssr: false }
);

const SiteSettingsServicesPreview = dynamic(
  () =>
    import("@/components/admin/site-settings-services-preview").then(
      (module) => module.SiteSettingsServicesPreview
    ),
  { loading: PreviewLoading, ssr: false }
);

const SiteSettingsAboutPreview = dynamic(
  () =>
    import("@/components/admin/site-settings-about-preview").then(
      (module) => module.SiteSettingsAboutPreview
    ),
  { loading: PreviewLoading, ssr: false }
);

const SiteSettingsContactPreview = dynamic(
  () =>
    import("@/components/admin/site-settings-contact-preview").then(
      (module) => module.SiteSettingsContactPreview
    ),
  { loading: PreviewLoading, ssr: false }
);

export function SiteSettingsPreview({
  formState,
  isDirty = false,
  updateField,
  onSubmit,
  working,
  siteHeroVideoFile,
  selectedFrameFiles,
  aboutTeamMemberImageFiles,
  setSiteHeroVideoFile,
  addSelectedFrameFiles,
  removeSelectedFrameFile,
  setAboutTeamMemberImageFile,
  handleFileSelection
}: SiteSettingsEditorProps) {
  const [page, setPage] = useState<PreviewPage>("home");
  const [previewWidth, setPreviewWidth] = useState<PreviewWidth>("desktop");

  return (
    <form onSubmit={onSubmit} id="site-settings-form" className="space-y-5">
      <SiteSettingsToolbar
        isDirty={isDirty}
        working={working}
        page={page}
        previewWidth={previewWidth}
        onPageChange={setPage}
        onPreviewWidthChange={setPreviewWidth}
      />

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="bg-panel-dark/20 min-w-0 overflow-x-auto rounded-[2rem] border border-line p-2 sm:p-4">
          <div
            className={cn(
              "mx-auto overflow-hidden rounded-[1.5rem] border border-line bg-background shadow-2xl transition-[max-width] duration-300",
              previewWidth === "mobile" ? "max-w-[430px]" : "max-w-none"
            )}
          >
            <div className="flex items-center gap-1.5 border-b border-line bg-panel-secondary px-4 py-3">
              <span className="bg-error/70 h-2.5 w-2.5 rounded-full" />
              <span className="bg-warning/70 h-2.5 w-2.5 rounded-full" />
              <span className="bg-success/70 h-2.5 w-2.5 rounded-full" />
              <span className="ml-3 truncate rounded-full border border-line bg-panel px-4 py-1 text-[0.58rem] uppercase tracking-ui text-muted">
                Live preview · click any highlighted text to edit
              </span>
            </div>
            <SiteSettingsPreviewHeader
              formState={formState}
              updateField={updateField}
              page={page}
              onPageChange={setPage}
            />
            <main>
              {page === "home" ? (
                <SiteSettingsHomePreview
                  formState={formState}
                  updateField={updateField}
                  selectedFrameFiles={selectedFrameFiles}
                  addSelectedFrameFiles={addSelectedFrameFiles}
                  removeSelectedFrameFile={removeSelectedFrameFile}
                />
              ) : null}
              {page === "work" ? (
                <SiteSettingsWorkPreview
                  formState={formState}
                  updateField={updateField}
                />
              ) : null}
              {page === "services" ? (
                <SiteSettingsServicesPreview
                  formState={formState}
                  updateField={updateField}
                />
              ) : null}
              {page === "about" ? (
                <SiteSettingsAboutPreview
                  formState={formState}
                  updateField={updateField}
                  aboutTeamMemberImageFiles={aboutTeamMemberImageFiles}
                  setAboutTeamMemberImageFile={setAboutTeamMemberImageFile}
                />
              ) : null}
              {page === "contact" ? (
                <SiteSettingsContactPreview
                  formState={formState}
                  updateField={updateField}
                />
              ) : null}
            </main>
            <SiteSettingsPreviewFooter
              formState={formState}
              updateField={updateField}
            />
          </div>
        </div>

        <SiteSettingsInspector
          formState={formState}
          updateField={updateField}
          siteHeroVideoFile={siteHeroVideoFile}
          selectedFrameFiles={selectedFrameFiles}
          setSiteHeroVideoFile={setSiteHeroVideoFile}
          addSelectedFrameFiles={addSelectedFrameFiles}
          removeSelectedFrameFile={removeSelectedFrameFile}
          handleFileSelection={handleFileSelection}
        />
      </div>

      <div className="sticky bottom-4 z-30 flex items-center justify-between gap-4 rounded-2xl border border-line bg-panel px-4 py-3 shadow-lg backdrop-blur-xl">
        <p className="text-xs text-muted">
          {isDirty
            ? "Changes are visible in the preview and not yet published."
            : "Preview matches the saved site settings."}
        </p>
        <button type="submit" disabled={working} className="action-button">
          {working ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : isDirty ? (
            <Save className="h-4 w-4" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {isDirty ? "Save changes" : "Saved"}
        </button>
      </div>
    </form>
  );
}
