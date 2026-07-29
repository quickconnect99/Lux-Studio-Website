"use client";

import { Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import type { SiteSettingsFieldsProps } from "@/components/admin/site-settings-editor-types";
import { cn } from "@/lib/utils";

export function SiteSettingsInspector({
  formState,
  updateField,
  siteHeroVideoFile = null,
  setSiteHeroVideoFile,
  handleFileSelection
}: SiteSettingsFieldsProps) {
  const socialLinks = formState.socialLinks;

  function updateSocialLink(
    index: number,
    key: "label" | "href",
    value: string
  ) {
    const next = [...socialLinks];
    next[index] = { ...next[index], [key]: value };
    updateField("socialLinks", next);
  }

  function addSocialLink() {
    updateField("socialLinks", [
      ...socialLinks,
      { label: "New link", href: "https://" }
    ]);
  }

  function removeSocialLink(index: number) {
    updateField(
      "socialLinks",
      socialLinks.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  return (
    <section className="grid gap-4 lg:grid-cols-2">
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
              data-site-navigation={item.key}
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
                  item.value ? "text-success-text" : "text-muted"
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
        </div>
      </div>

      <div className="panel-2xl p-5 lg:col-span-2">
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

      <div className="panel-2xl p-5 lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-eyebrow text-muted">
            Social destinations
          </p>
          <button
            type="button"
            onClick={addSocialLink}
            className="control-pill"
          >
            <Plus className="h-3.5 w-3.5" />
            Add link
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {socialLinks.map((link, index) => (
            <div
              key={`${link.href}-${index}`}
              className="grid gap-3 rounded-2xl border border-line bg-panel-secondary p-3 sm:grid-cols-[0.7fr_1.3fr_44px]"
            >
              <label className="space-y-2 text-xs uppercase tracking-meta text-muted">
                Label
                <input
                  value={link.label}
                  onChange={(event) =>
                    updateSocialLink(index, "label", event.target.value)
                  }
                  className="input-field text-sm normal-case tracking-normal"
                />
              </label>
              <label className="space-y-2 text-xs uppercase tracking-meta text-muted">
                URL
                <input
                  type="url"
                  value={link.href}
                  onChange={(event) =>
                    updateSocialLink(index, "href", event.target.value)
                  }
                  className="input-field text-sm normal-case tracking-normal"
                  placeholder="https://"
                />
              </label>
              <button
                type="button"
                onClick={() => removeSocialLink(index)}
                className="mt-auto flex h-11 w-11 items-center justify-center rounded-xl text-muted transition-colors hover:bg-panel hover:text-error-text"
                aria-label={`Remove ${link.label || "social"} link`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {socialLinks.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line p-4 text-xs leading-6 text-muted">
              No social destinations configured.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
