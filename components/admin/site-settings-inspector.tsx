"use client";

import { Eye, EyeOff } from "lucide-react";
import { GalleryEditor } from "@/components/admin/gallery-editor";
import type { SiteSettingsFieldsProps } from "@/components/admin/site-settings-editor-types";
import { parseMultilineInput } from "@/lib/admin-utils";
import { cn } from "@/lib/utils";

export function SiteSettingsInspector({
  formState,
  updateField,
  siteHeroVideoFile = null,
  selectedFrameFiles = [],
  setSiteHeroVideoFile,
  addSelectedFrameFiles,
  removeSelectedFrameFile,
  handleFileSelection
}: SiteSettingsFieldsProps) {
  const selectedFrames = parseMultilineInput(formState.selectedFramesText);

  function handleSelectedFramesChange(images: string[]) {
    updateField("selectedFramesText", images.join("\n"));
  }

  return (
    <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
      <div className="panel-2xl p-5">
        <p className="text-xs uppercase tracking-eyebrow text-muted">
          Main navigation
        </p>
        <p className="mt-2 text-xs leading-5 text-muted">
          Hidden tabs disappear from the header, mobile menu, and footer.
        </p>
        <div className="mt-4 space-y-2">
          {[
            {
              key: "navigationHome" as const,
              label: "Home",
              value: formState.navigationHome
            },
            {
              key: "navigationWork" as const,
              label: "Work",
              value: formState.navigationWork
            },
            {
              key: "navigationServices" as const,
              label: "Services",
              value: formState.navigationServices
            },
            {
              key: "navigationAbout" as const,
              label: "About",
              value: formState.navigationAbout
            },
            {
              key: "navigationContact" as const,
              label: "Contact",
              value: formState.navigationContact
            }
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => updateField(item.key, !item.value)}
              aria-pressed={item.value}
              className={cn(
                "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm transition-colors",
                item.value
                  ? "border-line bg-panel-secondary text-foreground"
                  : "border-dashed border-line bg-transparent text-muted"
              )}
            >
              <span>{item.label}</span>
              <span
                className={cn(
                  "inline-flex items-center gap-2 text-[0.58rem] uppercase tracking-ui",
                  item.value ? "text-success" : "text-muted"
                )}
              >
                {item.value ? (
                  <Eye className="h-3.5 w-3.5" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5" />
                )}
                {item.value ? "Visible" : "Hidden"}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="panel-2xl p-5">
        <p className="text-xs uppercase tracking-eyebrow text-muted">
          Brand assets
        </p>
        <div className="mt-4 space-y-4">
          <label className="block space-y-2 text-xs uppercase tracking-meta text-muted">
            Brand mark
            <input
              value={formState.brandMark}
              onChange={(event) => updateField("brandMark", event.target.value)}
              className="input-field text-sm normal-case tracking-normal"
            />
          </label>
          <label className="block space-y-2 text-xs uppercase tracking-meta text-muted">
            Hero reel link
            <input
              value={formState.heroVideoUrl}
              onChange={(event) => {
                updateField("heroVideoUrl", event.target.value);
                if (event.target.value) setSiteHeroVideoFile?.(null);
              }}
              className="input-field text-sm normal-case tracking-normal"
              placeholder="https://.../hero-reel.mp4"
            />
            <span className="block text-[0.62rem] normal-case leading-5 tracking-normal text-muted">
              Direct public `.mp4` or `.webm` URL for the autoplay background.
              You can also upload a file below.
            </span>
          </label>
          <div className="space-y-2 text-xs uppercase tracking-meta text-muted">
            <span>
              Hero reel upload
              {siteHeroVideoFile ? " · queued" : ""}
            </span>
            <input
              type="file"
              accept="video/*"
              onChange={(event) => {
                handleFileSelection?.(event, "siteHeroVideo");
                if ((event.target.files?.length ?? 0) > 0) {
                  updateField("heroVideoUrl", "");
                }
              }}
              className="block w-full text-xs uppercase tracking-meta text-muted"
            />
            {siteHeroVideoFile ? (
              <p className="text-xs normal-case leading-5 tracking-normal text-muted">
                Queued: {siteHeroVideoFile.name}. The URL is filled after save.
              </p>
            ) : null}
          </div>
          <div className="space-y-2 text-xs uppercase tracking-meta text-muted">
            Selected frames
            <GalleryEditor
              images={selectedFrames}
              captions={[]}
              pendingFiles={selectedFrameFiles}
              onImagesChange={handleSelectedFramesChange}
              onFilesAdd={addSelectedFrameFiles ?? (() => undefined)}
              onFileRemove={removeSelectedFrameFile ?? (() => undefined)}
              introText="Order controls the homepage selected-frame strip. Frame 01 is shown first."
              captionPlaceholder={(index) =>
                `Optional internal note for selected frame ${index + 1}`
              }
              getFrameRole={(index) => ({
                label: index === 0 ? "Homepage lead" : "Homepage frame",
                description:
                  index === 0
                    ? "First still in the homepage selected-frame sequence."
                    : "Supporting still in the homepage selected-frame sequence."
              })}
            />
            <span className="block text-[0.62rem] normal-case leading-5 tracking-normal text-muted">
              These drive the first gallery impression on the homepage. Uploads
              are added to the list after save.
            </span>
          </div>
        </div>
      </div>

      <div className="panel-2xl p-5">
        <p className="text-xs uppercase tracking-eyebrow text-muted">
          SEO & sharing
        </p>
        <div className="mt-4 space-y-4">
          <label className="block space-y-2 text-xs uppercase tracking-meta text-muted">
            SEO title
            <input
              value={formState.seoTitle}
              onChange={(event) => updateField("seoTitle", event.target.value)}
              className="input-field text-sm normal-case tracking-normal"
            />
          </label>
          <label className="block space-y-2 text-xs uppercase tracking-meta text-muted">
            Meta description
            <textarea
              value={formState.seoDescription}
              onChange={(event) =>
                updateField("seoDescription", event.target.value)
              }
              className="textarea-field min-h-28 text-sm normal-case leading-6 tracking-normal"
            />
          </label>
        </div>
      </div>

      <div className="panel-2xl p-5">
        <p className="text-xs uppercase tracking-eyebrow text-muted">
          Social destinations
        </p>
        <textarea
          value={formState.socialLinksText}
          onChange={(event) =>
            updateField("socialLinksText", event.target.value)
          }
          className="textarea-field mt-4 min-h-32 text-sm leading-6"
          placeholder="Instagram | https://instagram.com/..."
        />
        <p className="mt-2 text-[0.62rem] leading-5 text-muted">
          One line per link: label | URL
        </p>
      </div>
    </aside>
  );
}
