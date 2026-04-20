"use client";

import { CheckCircle2, RefreshCw } from "lucide-react";
import type { SiteSettingsFormState } from "@/lib/admin-types";

type Props = {
  formState: SiteSettingsFormState;
  updateField: <K extends keyof SiteSettingsFormState>(
    key: K,
    value: SiteSettingsFormState[K]
  ) => void;
  onSubmit: (event: { preventDefault(): void }) => void;
  working: boolean;
};

function SectionHeader({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4 border-b border-line pb-3">
      <p className="text-xs uppercase tracking-eyebrow text-muted">{title}</p>
      <p className="mt-1 text-xs leading-6 text-muted">{description}</p>
    </div>
  );
}

export function SiteSettingsForm({
  formState,
  updateField,
  onSubmit,
  working
}: Props) {
  return (
    <div className="max-w-3xl space-y-6">
      <form onSubmit={onSubmit} id="site-settings-form" className="space-y-6">
        {/* ── Brand ─────────────────────────────────────────────────────── */}
        <div className="panel-2xl p-6 sm:p-8">
          <SectionHeader
            title="Brand"
            description="Studio name, mark, and positioning line used in the header, footer, and structured data."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="space-y-2 text-sm text-muted">
              <span className="text-xs uppercase tracking-eyebrow">
                Brand name
              </span>
              <input
                value={formState.brandName}
                onChange={(e) => updateField("brandName", e.target.value)}
                className="input-field"
              />
            </label>
            <label className="space-y-2 text-sm text-muted">
              <span className="text-xs uppercase tracking-eyebrow">
                Brand mark
              </span>
              <input
                value={formState.brandMark}
                onChange={(e) => updateField("brandMark", e.target.value)}
                className="input-field"
              />
            </label>
            <label className="space-y-2 text-sm text-muted sm:col-span-2 lg:col-span-1">
              <span className="text-xs uppercase tracking-eyebrow">
                Brand strapline
              </span>
              <input
                value={formState.brandStrapline}
                onChange={(e) => updateField("brandStrapline", e.target.value)}
                className="input-field"
              />
            </label>
          </div>
        </div>

        {/* ── SEO ───────────────────────────────────────────────────────── */}
        <div className="panel-2xl p-6 sm:p-8">
          <SectionHeader
            title="SEO & Open Graph"
            description="Page title, meta description, and OG image used across all pages and social previews."
          />
          <div className="space-y-4">
            <label className="block space-y-2 text-sm text-muted">
              <span className="text-xs uppercase tracking-eyebrow">
                SEO title
              </span>
              <input
                value={formState.seoTitle}
                onChange={(e) => updateField("seoTitle", e.target.value)}
                className="input-field"
                placeholder="Studio Name | Tagline"
              />
            </label>
            <label className="block space-y-2 text-sm text-muted">
              <span className="text-xs uppercase tracking-eyebrow">
                Meta description
              </span>
              <textarea
                value={formState.seoDescription}
                onChange={(e) => updateField("seoDescription", e.target.value)}
                className="textarea-field min-h-20"
                placeholder="A concise description of your studio for search engines…"
              />
            </label>
            <label className="block space-y-2 text-sm text-muted">
              <span className="text-xs uppercase tracking-eyebrow">
                OG image path or URL
              </span>
              <input
                value={formState.seoOgImage}
                onChange={(e) => updateField("seoOgImage", e.target.value)}
                className="input-field"
                placeholder="/images/og-cover.jpg"
              />
              <p className="text-xs uppercase tracking-meta text-muted">
                Used as the preview image when the site is shared on social
                media.
              </p>
            </label>
          </div>
        </div>

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <div className="panel-2xl p-6 sm:p-8">
          <SectionHeader
            title="Homepage Hero"
            description="Text and video shown in the full-width hero section on the homepage."
          />
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-2 text-sm text-muted">
                <span className="text-xs uppercase tracking-eyebrow">
                  Eyebrow
                </span>
                <input
                  value={formState.heroEyebrow}
                  onChange={(e) => updateField("heroEyebrow", e.target.value)}
                  className="input-field"
                />
              </label>
              <label className="space-y-2 text-sm text-muted">
                <span className="text-xs uppercase tracking-eyebrow">
                  Headline — lead
                </span>
                <input
                  value={formState.heroHeadlineLead}
                  onChange={(e) =>
                    updateField("heroHeadlineLead", e.target.value)
                  }
                  className="input-field"
                  placeholder="Drive"
                />
              </label>
              <label className="space-y-2 text-sm text-muted">
                <span className="text-xs uppercase tracking-eyebrow">
                  Headline — trail
                </span>
                <input
                  value={formState.heroHeadlineTrail}
                  onChange={(e) =>
                    updateField("heroHeadlineTrail", e.target.value)
                  }
                  className="input-field"
                  placeholder="In Motion"
                />
              </label>
            </div>
            <label className="block space-y-2 text-sm text-muted">
              <span className="text-xs uppercase tracking-eyebrow">
                Hero copy
              </span>
              <textarea
                value={formState.heroCopy}
                onChange={(e) => updateField("heroCopy", e.target.value)}
                className="textarea-field min-h-20"
              />
            </label>
            <label className="block space-y-2 text-sm text-muted">
              <span className="text-xs uppercase tracking-eyebrow">
                Hero video URL
              </span>
              <input
                value={formState.heroVideoUrl}
                onChange={(e) => updateField("heroVideoUrl", e.target.value)}
                className="input-field"
                placeholder="/media/hero-showreel.mp4 or https://…"
              />
              <p className="text-xs uppercase tracking-meta text-muted">
                Local path from public/ or a full Supabase storage URL.
              </p>
            </label>
          </div>
        </div>

        {/* ── About ─────────────────────────────────────────────────────── */}
        <div className="panel-2xl p-6 sm:p-8">
          <SectionHeader
            title="About Page"
            description="Founder note, positioning paragraph, and the three studio values."
          />
          <div className="space-y-4">
            <label className="block space-y-2 text-sm text-muted">
              <span className="text-xs uppercase tracking-eyebrow">
                Founder note
              </span>
              <textarea
                value={formState.aboutFounderNote}
                onChange={(e) =>
                  updateField("aboutFounderNote", e.target.value)
                }
                className="textarea-field min-h-24"
              />
            </label>
            <label className="block space-y-2 text-sm text-muted">
              <span className="text-xs uppercase tracking-eyebrow">
                Positioning paragraph
              </span>
              <textarea
                value={formState.aboutPositioning}
                onChange={(e) =>
                  updateField("aboutPositioning", e.target.value)
                }
                className="textarea-field min-h-24"
              />
            </label>
            <label className="block space-y-2 text-sm text-muted">
              <span className="text-xs uppercase tracking-eyebrow">
                Studio values
              </span>
              <textarea
                value={formState.aboutValuesText}
                onChange={(e) => updateField("aboutValuesText", e.target.value)}
                className="textarea-field min-h-24"
                placeholder={
                  "Precision | Every motion decision should feel measured.\nAtmosphere | Light, sound, and spacing build premium emotion.\nClarity | The subject stays legible even in cinematic storytelling."
                }
              />
              <p className="text-xs uppercase tracking-meta text-muted">
                One value per line — format: Title | Description
              </p>
            </label>
          </div>
        </div>

        {/* ── Services ──────────────────────────────────────────────────── */}
        <div className="panel-2xl p-6 sm:p-8">
          <SectionHeader
            title="Services"
            description="All service offerings shown on the Services page and homepage snapshot. One service per line."
          />
          <label className="block space-y-2 text-sm text-muted">
            <span className="text-xs uppercase tracking-eyebrow">
              Services list
            </span>
            <textarea
              value={formState.servicesText}
              onChange={(e) => updateField("servicesText", e.target.value)}
              className="textarea-field min-h-40"
              placeholder={
                "01 | Commercial Shoots | Full-scale campaign films… | Hero film, Edit suite, Stills\n02 | Social Content | Vertical edits… | Reels, Stories, Teasers"
              }
            />
            <p className="text-xs uppercase tracking-meta text-muted">
              Format: Number | Title | Description | Deliverable 1, Deliverable
              2, …
            </p>
          </label>
        </div>

        {/* ── Contact ───────────────────────────────────────────────────── */}
        <div className="panel-2xl p-6 sm:p-8">
          <SectionHeader
            title="Contact & Social"
            description="Email, phone, and city shown in the footer and contact page. Social links for header and structured data."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="space-y-2 text-sm text-muted">
              <span className="text-xs uppercase tracking-eyebrow">Email</span>
              <input
                value={formState.contactEmail}
                onChange={(e) => updateField("contactEmail", e.target.value)}
                className="input-field"
              />
            </label>
            <label className="space-y-2 text-sm text-muted">
              <span className="text-xs uppercase tracking-eyebrow">Phone</span>
              <input
                value={formState.contactPhone}
                onChange={(e) => updateField("contactPhone", e.target.value)}
                className="input-field"
              />
            </label>
            <label className="space-y-2 text-sm text-muted">
              <span className="text-xs uppercase tracking-eyebrow">
                City / Region
              </span>
              <input
                value={formState.contactCity}
                onChange={(e) => updateField("contactCity", e.target.value)}
                className="input-field"
              />
            </label>
          </div>

          <label className="mt-4 block space-y-2 text-sm text-muted">
            <span className="text-xs uppercase tracking-eyebrow">
              Social links
            </span>
            <textarea
              value={formState.socialLinksText}
              onChange={(e) => updateField("socialLinksText", e.target.value)}
              className="textarea-field min-h-28"
              placeholder="Instagram | https://instagram.com/yourstudio"
            />
            <p className="text-xs uppercase tracking-meta text-muted">
              One entry per line — format: Label | URL
            </p>
          </label>
        </div>

        {/* ── Save bar ──────────────────────────────────────────────────── */}
        <div className="sticky bottom-4 z-20">
          <div className="flex items-center justify-end rounded-2xl border border-line bg-panel px-4 py-3 shadow-lg backdrop-blur-md">
            <button type="submit" disabled={working} className="action-button">
              {working ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Save Site Settings
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
