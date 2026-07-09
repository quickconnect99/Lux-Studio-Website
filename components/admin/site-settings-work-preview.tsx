"use client";

import { updateCopySection } from "@/components/admin/site-settings-copy";
import type { SiteSettingsFieldsProps } from "@/components/admin/site-settings-editor-types";
import { SiteSettingsPageHeader } from "@/components/admin/site-settings-page-header";

export function SiteSettingsWorkPreview({
  formState,
  updateField
}: SiteSettingsFieldsProps) {
  return (
    <>
      <SiteSettingsPageHeader
        eyebrow={formState.copy.work.eyebrow}
        lead={formState.copy.work.headlineLead}
        trail={formState.copy.work.headlineTrail}
        copy={formState.copy.work.copy}
        onEyebrowChange={(value) =>
          updateCopySection(formState, updateField, "work", {
            eyebrow: value
          })
        }
        onLeadChange={(value) =>
          updateCopySection(formState, updateField, "work", {
            headlineLead: value
          })
        }
        onTrailChange={(value) =>
          updateCopySection(formState, updateField, "work", {
            headlineTrail: value
          })
        }
        onCopyChange={(value) =>
          updateCopySection(formState, updateField, "work", {
            copy: value
          })
        }
      />
      <section className="px-6 pb-12 sm:px-10">
        <p className="rounded-2xl border border-line bg-panel-secondary px-5 py-4 text-xs text-muted">
          Die Projektliste dieser Seite wird im Bereich Projects gepflegt. In
          diesem Work-Tab sind nur die Seitentexte editierbar.
        </p>
      </section>
    </>
  );
}
