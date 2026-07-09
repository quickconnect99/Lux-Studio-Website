"use client";

import { Eye, EyeOff } from "lucide-react";
import type { SiteSettingsFieldsProps } from "@/components/admin/site-settings-editor-types";
import { cn } from "@/lib/utils";

export function SiteSettingsInspector({
  formState,
  updateField
}: SiteSettingsFieldsProps) {
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
            Hero video URL
            <input
              value={formState.heroVideoUrl}
              onChange={(event) =>
                updateField("heroVideoUrl", event.target.value)
              }
              className="input-field text-sm normal-case tracking-normal"
            />
            <span className="block text-[0.62rem] normal-case leading-5 tracking-normal text-muted">
              Use a direct public video file URL, for example a Supabase Storage
              `.mp4` or `.webm`. YouTube/Vimeo links are not used as the
              autoplay hero background.
            </span>
          </label>
          <label className="block space-y-2 text-xs uppercase tracking-meta text-muted">
            Selected frames
            <textarea
              value={formState.selectedFramesText}
              onChange={(event) =>
                updateField("selectedFramesText", event.target.value)
              }
              className="textarea-field min-h-32 text-sm normal-case leading-6 tracking-normal"
              placeholder="/images/frame-01.jpg"
            />
            <span className="block text-[0.62rem] normal-case leading-5 tracking-normal text-muted">
              One image URL per line. These drive the first gallery impression
              on the homepage.
            </span>
          </label>
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
          <label className="block space-y-2 text-xs uppercase tracking-meta text-muted">
            OG image
            <input
              value={formState.seoOgImage}
              onChange={(event) =>
                updateField("seoOgImage", event.target.value)
              }
              className="input-field text-sm normal-case tracking-normal"
            />
            <span className="block text-[0.62rem] normal-case leading-5 tracking-normal text-muted">
              Use a public image URL or a site path like
              `/images/demo-car-01.jpg`.
            </span>
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
