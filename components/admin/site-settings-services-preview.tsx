"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { updateCopySection } from "@/components/admin/site-settings-copy";
import { type SiteSettingsEditorProps as Props } from "@/components/admin/site-settings-editor-types";
import { InlineText } from "@/components/admin/site-settings-inline-text";
import { SiteSettingsPageHeader } from "@/components/admin/site-settings-page-header";

export function SiteSettingsServicesPreview({
  formState,
  updateField
}: Pick<Props, "formState" | "updateField">) {
  const services = formState.services;

  function updateService(
    index: number,
    key: "number" | "title" | "description",
    value: string
  ) {
    const next = [...services];
    next[index] = { ...next[index], [key]: value };
    updateField("services", next);
  }

  function updateDeliverable(
    serviceIndex: number,
    deliverableIndex: number,
    value: string
  ) {
    const next = [...services];
    const deliverables = [...next[serviceIndex].deliverables];
    deliverables[deliverableIndex] = value;
    next[serviceIndex] = { ...next[serviceIndex], deliverables };
    updateField("services", next);
  }

  function addService() {
    updateField("services", [
      ...services,
      {
        number: String(services.length + 1).padStart(2, "0"),
        title: "New service",
        description: "",
        deliverables: []
      }
    ]);
  }

  function removeService(index: number) {
    updateField(
      "services",
      services.filter((_, serviceIndex) => serviceIndex !== index)
    );
  }

  function moveService(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= services.length) return;
    const next = [...services];
    const [service] = next.splice(index, 1);
    next.splice(target, 0, service);
    updateField("services", next);
  }

  function addDeliverable(serviceIndex: number) {
    const next = [...services];
    next[serviceIndex] = {
      ...next[serviceIndex],
      deliverables: [...next[serviceIndex].deliverables, "New deliverable"]
    };
    updateField("services", next);
  }

  function removeDeliverable(serviceIndex: number, deliverableIndex: number) {
    const next = [...services];
    next[serviceIndex] = {
      ...next[serviceIndex],
      deliverables: next[serviceIndex].deliverables.filter(
        (_, index) => index !== deliverableIndex
      )
    };
    updateField("services", next);
  }

  return (
    <>
      <SiteSettingsPageHeader
        eyebrow={formState.copy.services.eyebrow}
        lead={formState.copy.services.headlineLead}
        trail={formState.copy.services.headlineTrail}
        copy={formState.copy.services.copy}
        onEyebrowChange={(value) =>
          updateCopySection(formState, updateField, "services", {
            eyebrow: value
          })
        }
        onLeadChange={(value) =>
          updateCopySection(formState, updateField, "services", {
            headlineLead: value
          })
        }
        onTrailChange={(value) =>
          updateCopySection(formState, updateField, "services", {
            headlineTrail: value
          })
        }
        onCopyChange={(value) =>
          updateCopySection(formState, updateField, "services", {
            copy: value
          })
        }
      />
      <section className="space-y-4 px-6 pb-12 sm:px-10">
        {services.map((service, index) => (
          <div
            key={`${service.number}-${index}`}
            data-preview-stack
            className="grid gap-5 rounded-[2rem] border border-line bg-panel-secondary p-6 lg:grid-cols-[100px_1fr_0.8fr]"
          >
            <div className="flex justify-end gap-1 lg:col-span-3">
              <button
                type="button"
                onClick={() => moveService(index, -1)}
                disabled={index === 0}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-panel text-muted hover:text-foreground disabled:opacity-35"
                aria-label={`Move ${service.title} up`}
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => moveService(index, 1)}
                disabled={index === services.length - 1}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-panel text-muted hover:text-foreground disabled:opacity-35"
                aria-label={`Move ${service.title} down`}
              >
                <ArrowDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => removeService(index)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-panel text-muted hover:text-error-text"
                aria-label={`Remove ${service.title}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <InlineText
              value={service.number}
              placeholder="00"
              ariaLabel={`Service ${index + 1} number`}
              onChange={(value) => updateService(index, "number", value)}
              className="w-fit p-2 font-[family-name:var(--font-mono)] text-sm text-accent-text"
            />
            <div className="space-y-3">
              <InlineText
                value={service.title}
                placeholder="Service title"
                ariaLabel={`Service ${index + 1} title`}
                onChange={(value) => updateService(index, "title", value)}
                className="p-2 font-[family-name:var(--font-display)] text-3xl uppercase leading-none"
                inputClassName="text-xl uppercase"
              />
              <InlineText
                value={service.description}
                placeholder="Service description"
                ariaLabel={`Service ${index + 1} description`}
                multiline
                onChange={(value) => updateService(index, "description", value)}
                className="p-2 text-sm leading-7 text-muted"
              />
            </div>
            <div className="space-y-2">
              {service.deliverables.map((item, deliverableIndex) => (
                <div
                  key={`${item}-${deliverableIndex}`}
                  className="flex items-center gap-2"
                >
                  <InlineText
                    value={item}
                    placeholder="Deliverable"
                    ariaLabel={`Deliverable ${deliverableIndex + 1}`}
                    onChange={(value) =>
                      updateDeliverable(index, deliverableIndex, value)
                    }
                    className="min-w-0 flex-1 border-l-2 border-l-accent px-3 py-2 text-[0.65rem] uppercase tracking-meta text-muted"
                  />
                  <button
                    type="button"
                    onClick={() => removeDeliverable(index, deliverableIndex)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted hover:bg-panel hover:text-error-text"
                    aria-label={`Remove deliverable ${deliverableIndex + 1}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addDeliverable(index)}
                className="control-pill mt-2"
              >
                <Plus className="h-3.5 w-3.5" />
                Add deliverable
              </button>
            </div>
          </div>
        ))}
        <button type="button" onClick={addService} className="control-pill">
          <Plus className="h-3.5 w-3.5" />
          Add service
        </button>
      </section>
    </>
  );
}
