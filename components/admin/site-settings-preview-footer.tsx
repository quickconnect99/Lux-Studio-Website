"use client";

import { updateCopySection } from "@/components/admin/site-settings-copy";
import type { SiteSettingsFieldsProps } from "@/components/admin/site-settings-editor-types";
import { InlineText } from "@/components/admin/site-settings-inline-text";

export function SiteSettingsPreviewFooter({
  formState,
  updateField
}: SiteSettingsFieldsProps) {
  const social = formState.socialLinks;
  const navigation = [
    { label: "Home", visible: formState.navigationHome },
    { label: "Work", visible: formState.navigationWork },
    { label: "Services", visible: formState.navigationServices },
    { label: "About", visible: formState.navigationAbout },
    { label: "Contact", visible: formState.navigationContact }
  ].filter((item) => item.visible);

  function updateSocialLabel(index: number, value: string) {
    const next = [...social];
    next[index] = { ...next[index], label: value };
    updateField("socialLinks", next);
  }

  return (
    <footer className="border-t border-line px-6 py-10 sm:px-10">
      <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr_0.9fr]">
        <div className="space-y-4">
          <InlineText
            value={formState.brandName}
            placeholder="Brand name"
            ariaLabel="Brand name"
            onChange={(value) => updateField("brandName", value)}
            className="w-fit text-[0.68rem] uppercase tracking-eyebrow text-muted"
          />
          <InlineText
            value={formState.copy.footer.headline}
            placeholder="Footer headline"
            ariaLabel="Footer headline"
            multiline
            onChange={(value) =>
              updateCopySection(formState, updateField, "footer", {
                headline: value
              })
            }
            className="max-w-md p-2 text-2xl font-medium leading-tight sm:text-3xl"
            inputClassName="min-h-28 text-base leading-7"
          />
        </div>
        <div>
          <InlineText
            value={formState.copy.footer.navigationLabel}
            placeholder="Navigation label"
            ariaLabel="Footer navigation label"
            onChange={(value) =>
              updateCopySection(formState, updateField, "footer", {
                navigationLabel: value
              })
            }
            className="w-fit px-1 py-0.5 text-[0.62rem] uppercase tracking-eyebrow text-muted"
          />
          <div className="mt-4 space-y-2 text-xs uppercase tracking-meta">
            {navigation.length > 0 ? (
              navigation.map((item) => <p key={item.label}>{item.label}</p>)
            ) : (
              <p className="normal-case tracking-normal text-muted">
                No navigation links visible
              </p>
            )}
          </div>
        </div>
        <div>
          <InlineText
            value={formState.copy.footer.connectLabel}
            placeholder="Connect label"
            ariaLabel="Footer connect label"
            onChange={(value) =>
              updateCopySection(formState, updateField, "footer", {
                connectLabel: value
              })
            }
            className="w-fit px-1 py-0.5 text-[0.62rem] uppercase tracking-eyebrow text-muted"
          />
          <div className="mt-4 space-y-2 text-sm text-muted">
            <InlineText
              value={formState.contactEmail}
              placeholder="Email"
              ariaLabel="Contact email"
              onChange={(value) => updateField("contactEmail", value)}
              className="px-1"
            />
            <InlineText
              value={formState.contactPhone}
              placeholder="Phone"
              ariaLabel="Contact phone"
              onChange={(value) => updateField("contactPhone", value)}
              className="px-1"
            />
            <InlineText
              value={formState.contactCity}
              placeholder="City"
              ariaLabel="Contact city"
              onChange={(value) => updateField("contactCity", value)}
              className="px-1"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {social.map((item, index) => (
              <InlineText
                key={`${item.href}-${index}`}
                value={item.label}
                placeholder="Social"
                ariaLabel={`Social label ${index + 1}`}
                onChange={(value) => updateSocialLabel(index, value)}
                className="w-auto px-2 py-1 text-[0.58rem] uppercase tracking-ui text-muted"
              />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-8 border-t border-line pt-5">
        <InlineText
          value={formState.copy.footer.mediaNotice}
          placeholder="Footer notice"
          ariaLabel="Footer media notice"
          onChange={(value) =>
            updateCopySection(formState, updateField, "footer", {
              mediaNotice: value
            })
          }
          className="ml-auto w-fit px-2 py-1 text-[0.58rem] uppercase tracking-ui text-muted"
        />
      </div>
    </footer>
  );
}
