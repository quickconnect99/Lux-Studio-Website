"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import { updateCopySection } from "@/components/admin/site-settings-copy";
import { type SiteSettingsEditorProps as Props } from "@/components/admin/site-settings-editor-types";
import { InlineText } from "@/components/admin/site-settings-inline-text";
import { SiteSettingsPageHeader } from "@/components/admin/site-settings-page-header";

export function SiteSettingsContactPreview({
  formState,
  updateField
}: Pick<Props, "formState" | "updateField">) {
  const social = formState.socialLinks;

  return (
    <>
      <SiteSettingsPageHeader
        eyebrow={formState.copy.contact.eyebrow}
        lead={formState.copy.contact.headlineLead}
        trail={formState.copy.contact.headlineTrail}
        copy={formState.copy.contact.copy}
        onEyebrowChange={(value) =>
          updateCopySection(formState, updateField, "contact", {
            eyebrow: value
          })
        }
        onLeadChange={(value) =>
          updateCopySection(formState, updateField, "contact", {
            headlineLead: value
          })
        }
        onTrailChange={(value) =>
          updateCopySection(formState, updateField, "contact", {
            headlineTrail: value
          })
        }
        onCopyChange={(value) =>
          updateCopySection(formState, updateField, "contact", {
            copy: value
          })
        }
      />
      <section className="grid gap-5 px-6 pb-12 sm:px-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="panel-2xl p-7">
          <InlineText
            value={formState.copy.contact.directLabel}
            placeholder="Contact label"
            ariaLabel="Direct contact label"
            onChange={(value) =>
              updateCopySection(formState, updateField, "contact", {
                directLabel: value
              })
            }
            className="w-fit px-1 py-0.5 text-[0.62rem] uppercase tracking-eyebrow text-muted"
          />
          <div className="mt-5 space-y-3">
            {[
              {
                key: "contactEmail" as const,
                value: formState.contactEmail,
                icon: Mail,
                label: "Email"
              },
              {
                key: "contactPhone" as const,
                value: formState.contactPhone,
                icon: Phone,
                label: "Phone"
              },
              {
                key: "contactCity" as const,
                value: formState.contactCity,
                icon: MapPin,
                label: "City"
              }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.key} className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0 text-accent-text" />
                  <InlineText
                    value={item.value}
                    placeholder={item.label}
                    ariaLabel={item.label}
                    onChange={(value) => updateField(item.key, value)}
                    className="px-2 py-1 text-sm text-muted"
                  />
                </div>
              );
            })}
          </div>
          <InlineText
            value={formState.copy.contact.directCopy}
            placeholder="Contact description"
            ariaLabel="Direct contact description"
            multiline
            onChange={(value) =>
              updateCopySection(formState, updateField, "contact", {
                directCopy: value
              })
            }
            className="mt-5 p-2 text-sm leading-7 text-muted"
          />
          <div className="mt-7 flex flex-wrap gap-2">
            {social.map((item) => (
              <span
                key={item.href}
                className="muted-pill pointer-events-none min-h-9 px-3 py-1 text-[0.58rem]"
              >
                {item.label}
              </span>
            ))}
          </div>
        </div>
        <div className="panel-2xl p-7">
          <InlineText
            value={formState.copy.contact.formLabel}
            placeholder="Form label"
            ariaLabel="Contact form label"
            onChange={(value) =>
              updateCopySection(formState, updateField, "contact", {
                formLabel: value
              })
            }
            className="w-fit px-1 py-0.5 text-[0.62rem] uppercase tracking-eyebrow text-muted"
          />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {["Name", "Email", "Company", "Service type"].map((label) => (
              <div
                key={label}
                className="rounded-2xl border border-line bg-panel px-4 py-3 text-sm text-muted"
              >
                {label}
              </div>
            ))}
          </div>
          <div className="mt-3 min-h-28 rounded-3xl border border-line bg-panel px-4 py-3 text-sm text-muted">
            Project brief
          </div>
          <InlineText
            value={formState.copy.contact.submitLabel}
            placeholder="Submit button"
            ariaLabel="Contact submit button"
            onChange={(value) =>
              updateCopySection(formState, updateField, "contact", {
                submitLabel: value
              })
            }
            className="action-button mt-4 w-auto cursor-text"
          />
        </div>
      </section>
    </>
  );
}
