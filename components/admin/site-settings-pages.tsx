"use client";

import {
  Mail,
  MapPin,
  Phone
} from "lucide-react";
import { updateCopySection } from "@/components/admin/site-settings-copy";
import {
  type SiteSettingsEditorProps as Props
} from "@/components/admin/site-settings-editor-types";
import { InlineText } from "@/components/admin/site-settings-inline-text";
import { SiteSettingsPageHeader } from "@/components/admin/site-settings-page-header";
import {
  formatServicesText,
  formatValuesText,
  parseServicesText,
  parseSocialLinksText,
  parseValuesText
} from "@/lib/admin-utils";

export function HomePreview({
  formState,
  updateField
}: Pick<Props, "formState" | "updateField">) {
  const services = parseServicesText(formState.servicesText).slice(0, 4);

  return (
    <>
      <section className="relative overflow-hidden px-6 py-12 sm:px-10 sm:py-16">
        <div className="absolute inset-x-8 top-8 -z-10 h-80 rounded-[3rem] bg-hero-radial blur-3xl" />
        <div className="grid gap-10 xl:grid-cols-[0.95fr_1.05fr] xl:items-center">
          <div className="space-y-7">
            <InlineText
              value={formState.heroEyebrow}
              placeholder="Hero eyebrow"
              ariaLabel="Hero eyebrow"
              onChange={(value) => updateField("heroEyebrow", value)}
              className="w-fit px-2 py-1 text-[0.68rem] uppercase tracking-eyebrow text-muted"
            />
            <div className="font-[family:var(--font-display)] space-y-1 text-[clamp(3rem,7vw,6.5rem)] uppercase leading-[0.88] tracking-[-0.04em]">
              <InlineText
                value={formState.heroHeadlineLead}
                placeholder="Headline"
                ariaLabel="Hero headline lead"
                onChange={(value) => updateField("heroHeadlineLead", value)}
                className="px-2"
                inputClassName="text-3xl uppercase"
              />
              <InlineText
                value={formState.heroHeadlineTrail}
                placeholder="Headline accent"
                ariaLabel="Hero headline trail"
                onChange={(value) => updateField("heroHeadlineTrail", value)}
                className="ml-6 px-2 text-accent sm:ml-12"
                inputClassName="text-3xl uppercase"
              />
            </div>
            <InlineText
              value={formState.heroCopy}
              placeholder="Hero description"
              ariaLabel="Hero copy"
              multiline
              onChange={(value) => updateField("heroCopy", value)}
              className="max-w-2xl p-2 text-base leading-8 text-muted"
              inputClassName="min-h-32 text-base leading-7"
            />
            <div className="flex flex-wrap gap-3">
              <InlineText
                value={formState.copy.home.heroPrimaryCta}
                placeholder="Primary button"
                ariaLabel="Hero primary button"
                onChange={(value) =>
                  updateCopySection(formState, updateField, "home", {
                    heroPrimaryCta: value
                  })
                }
                className="action-button w-auto cursor-text"
              />
              <InlineText
                value={formState.copy.home.heroSecondaryCta}
                placeholder="Secondary button"
                ariaLabel="Hero secondary button"
                onChange={(value) =>
                  updateCopySection(formState, updateField, "home", {
                    heroSecondaryCta: value
                  })
                }
                className="control-pill w-auto cursor-text"
              />
            </div>
          </div>
          <div className="film-frame relative min-h-[380px] bg-panel-dark text-white">
            {formState.heroVideoUrl ? (
              <video
                key={formState.heroVideoUrl}
                src={formState.heroVideoUrl}
                poster={formState.seoOgImage}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-cover opacity-55"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/75" />
            <div className="absolute bottom-8 left-8 z-10">
              <div className="font-[family:var(--font-display)] text-4xl uppercase leading-none">
                <InlineText
                  value={formState.copy.home.videoHeadlineLead}
                  placeholder="Video headline"
                  ariaLabel="Video headline lead"
                  onChange={(value) =>
                    updateCopySection(formState, updateField, "home", {
                      videoHeadlineLead: value
                    })
                  }
                  className="px-2"
                />
                <InlineText
                  value={formState.copy.home.videoHeadlineTrail}
                  placeholder="Video headline accent"
                  ariaLabel="Video headline trail"
                  onChange={(value) =>
                    updateCopySection(formState, updateField, "home", {
                      videoHeadlineTrail: value
                    })
                  }
                  className="ml-8 mt-1 px-2 text-accent"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line px-6 py-5 sm:px-10">
        <InlineText
          value={formState.copy.home.selectedWorkLabel}
          placeholder="Selected work label"
          ariaLabel="Selected work label"
          onChange={(value) =>
            updateCopySection(formState, updateField, "home", {
              selectedWorkLabel: value
            })
          }
          className="w-fit px-2 py-1 text-xs uppercase tracking-eyebrow text-muted"
        />
      </section>

      <section className="border-y border-line px-6 py-10 sm:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <InlineText
              value={formState.copy.home.brandEyebrow}
              placeholder="Section label"
              ariaLabel="Brand section label"
              onChange={(value) =>
                updateCopySection(formState, updateField, "home", {
                  brandEyebrow: value
                })
              }
              className="w-fit px-2 py-1 text-[0.7rem] uppercase tracking-eyebrow text-muted"
            />
            <div className="font-[family:var(--font-display)] mt-5 text-4xl uppercase leading-none">
              <InlineText
                value={formState.copy.home.brandHeadlineLead}
                placeholder="Brand headline"
                ariaLabel="Brand headline lead"
                onChange={(value) =>
                  updateCopySection(formState, updateField, "home", {
                    brandHeadlineLead: value
                  })
                }
                className="px-2"
              />
              <InlineText
                value={formState.copy.home.brandHeadlineTrail}
                placeholder="Brand headline accent"
                ariaLabel="Brand headline trail"
                onChange={(value) =>
                  updateCopySection(formState, updateField, "home", {
                    brandHeadlineTrail: value
                  })
                }
                className="ml-8 mt-1 px-2 text-accent"
              />
            </div>
          </div>
          <div>
            <InlineText
              value={formState.brandStrapline}
              placeholder="Brand strapline"
              ariaLabel="Brand strapline"
              multiline
              onChange={(value) => updateField("brandStrapline", value)}
              className="p-2 text-base leading-8 text-muted"
            />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {services.map((service) => (
                <div
                  key={service.number}
                  className="rounded-3xl border border-line bg-panel-secondary p-5"
                >
                  <p className="text-[0.62rem] uppercase tracking-eyebrow text-accent">
                    {service.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-10 sm:px-10">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="panel-2xl p-7">
            <InlineText
              value={formState.copy.home.servicesEyebrow}
              placeholder="Services label"
              ariaLabel="Services section label"
              onChange={(value) =>
                updateCopySection(formState, updateField, "home", {
                  servicesEyebrow: value
                })
              }
              className="w-fit px-2 py-1 text-[0.7rem] uppercase tracking-eyebrow text-muted"
            />
            <div className="font-[family:var(--font-display)] mt-5 text-4xl uppercase leading-none">
              <InlineText
                value={formState.copy.home.servicesHeadlineLead}
                placeholder="Services headline"
                ariaLabel="Services headline lead"
                onChange={(value) =>
                  updateCopySection(formState, updateField, "home", {
                    servicesHeadlineLead: value
                  })
                }
                className="px-2"
              />
              <InlineText
                value={formState.copy.home.servicesHeadlineTrail}
                placeholder="Services headline accent"
                ariaLabel="Services headline trail"
                onChange={(value) =>
                  updateCopySection(formState, updateField, "home", {
                    servicesHeadlineTrail: value
                  })
                }
                className="ml-8 mt-1 px-2 text-accent"
              />
            </div>
          </div>

          <div className="dark-panel rounded-[2rem] p-7 text-white">
            <InlineText
              value={formState.copy.home.ctaEyebrow}
              placeholder="CTA label"
              ariaLabel="CTA label"
              onChange={(value) =>
                updateCopySection(formState, updateField, "home", {
                  ctaEyebrow: value
                })
              }
              className="w-fit px-2 py-1 text-[0.7rem] uppercase tracking-eyebrow text-white/70"
            />
            <div className="font-[family:var(--font-display)] mt-5 text-4xl uppercase leading-none">
              <InlineText
                value={formState.copy.home.ctaHeadlineLead}
                placeholder="CTA headline"
                ariaLabel="CTA headline lead"
                onChange={(value) =>
                  updateCopySection(formState, updateField, "home", {
                    ctaHeadlineLead: value
                  })
                }
                className="px-2 text-white"
              />
              <InlineText
                value={formState.copy.home.ctaHeadlineTrail}
                placeholder="CTA headline accent"
                ariaLabel="CTA headline trail"
                onChange={(value) =>
                  updateCopySection(formState, updateField, "home", {
                    ctaHeadlineTrail: value
                  })
                }
                className="ml-8 mt-1 px-2 text-accent"
              />
            </div>
            <InlineText
              value={formState.copy.home.ctaCopy}
              placeholder="CTA description"
              ariaLabel="CTA description"
              multiline
              onChange={(value) =>
                updateCopySection(formState, updateField, "home", {
                  ctaCopy: value
                })
              }
              className="mt-5 p-2 text-sm leading-7 text-white/75"
            />
            <InlineText
              value={formState.copy.home.ctaButton}
              placeholder="CTA button"
              ariaLabel="CTA button"
              onChange={(value) =>
                updateCopySection(formState, updateField, "home", {
                  ctaButton: value
                })
              }
              className="action-button mt-5 w-auto cursor-text"
            />
          </div>
        </div>
      </section>
    </>
  );
}

export function ServicesPreview({
  formState,
  updateField
}: Pick<Props, "formState" | "updateField">) {
  const services = parseServicesText(formState.servicesText);

  function updateService(
    index: number,
    key: "number" | "title" | "description",
    value: string
  ) {
    const next = [...services];
    next[index] = { ...next[index], [key]: value };
    updateField("servicesText", formatServicesText(next));
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
    updateField("servicesText", formatServicesText(next));
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
            className="grid gap-5 rounded-[2rem] border border-line bg-panel-secondary p-6 lg:grid-cols-[100px_1fr_0.8fr]"
          >
            <InlineText
              value={service.number}
              placeholder="00"
              ariaLabel={`Service ${index + 1} number`}
              onChange={(value) => updateService(index, "number", value)}
              className="font-[family:var(--font-mono)] w-fit p-2 text-sm text-accent"
            />
            <div className="space-y-3">
              <InlineText
                value={service.title}
                placeholder="Service title"
                ariaLabel={`Service ${index + 1} title`}
                onChange={(value) => updateService(index, "title", value)}
                className="font-[family:var(--font-display)] p-2 text-3xl uppercase leading-none"
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
                <InlineText
                  key={`${item}-${deliverableIndex}`}
                  value={item}
                  placeholder="Deliverable"
                  ariaLabel={`Deliverable ${deliverableIndex + 1}`}
                  onChange={(value) =>
                    updateDeliverable(index, deliverableIndex, value)
                  }
                  className="border-l-2 border-l-accent px-3 py-2 text-[0.65rem] uppercase tracking-meta text-muted"
                />
              ))}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}

export function AboutPreview({
  formState,
  updateField
}: Pick<Props, "formState" | "updateField">) {
  const values = parseValuesText(formState.aboutValuesText);

  function updateValue(index: number, key: "title" | "copy", value: string) {
    const next = [...values];
    next[index] = { ...next[index], [key]: value };
    updateField("aboutValuesText", formatValuesText(next));
  }

  return (
    <>
      <SiteSettingsPageHeader
        eyebrow={formState.copy.about.eyebrow}
        lead={formState.copy.about.headlineLead}
        trail={formState.copy.about.headlineTrail}
        copy={formState.aboutPositioning}
        onEyebrowChange={(value) =>
          updateCopySection(formState, updateField, "about", {
            eyebrow: value
          })
        }
        onLeadChange={(value) =>
          updateCopySection(formState, updateField, "about", {
            headlineLead: value
          })
        }
        onTrailChange={(value) =>
          updateCopySection(formState, updateField, "about", {
            headlineTrail: value
          })
        }
        onCopyChange={(value) => updateField("aboutPositioning", value)}
      />
      <section className="px-6 pb-12 sm:px-10">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="panel-2xl p-7">
            <InlineText
              value={formState.copy.about.founderLabel}
              placeholder="Founder label"
              ariaLabel="Founder label"
              onChange={(value) =>
                updateCopySection(formState, updateField, "about", {
                  founderLabel: value
                })
              }
              className="w-fit px-1 py-0.5 text-[0.62rem] uppercase tracking-eyebrow text-muted"
            />
            <InlineText
              value={formState.aboutFounderNote}
              placeholder="Founder note"
              ariaLabel="Founder note"
              multiline
              onChange={(value) => updateField("aboutFounderNote", value)}
              className="mt-4 p-2 text-sm leading-7 text-muted"
              inputClassName="min-h-40"
            />
          </div>
          <div className="panel-2xl p-7">
            <InlineText
              value={formState.copy.about.positioningLabel}
              placeholder="Positioning label"
              ariaLabel="Positioning label"
              onChange={(value) =>
                updateCopySection(formState, updateField, "about", {
                  positioningLabel: value
                })
              }
              className="w-fit px-1 py-0.5 text-[0.62rem] uppercase tracking-eyebrow text-muted"
            />
            <InlineText
              value={formState.aboutPositioning}
              placeholder="Positioning"
              ariaLabel="Positioning"
              multiline
              onChange={(value) => updateField("aboutPositioning", value)}
              className="mt-4 p-2 text-sm leading-7 text-muted"
              inputClassName="min-h-40"
            />
          </div>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          {values.map((value, index) => (
            <div
              key={`${value.title}-${index}`}
              className="rounded-[1.75rem] border border-line bg-panel-secondary p-6"
            >
              <InlineText
                value={value.title}
                placeholder="Value title"
                ariaLabel={`Value ${index + 1} title`}
                onChange={(nextValue) => updateValue(index, "title", nextValue)}
                className="p-1 text-[0.62rem] uppercase tracking-eyebrow text-accent"
              />
              <InlineText
                value={value.copy}
                placeholder="Value description"
                ariaLabel={`Value ${index + 1} description`}
                multiline
                onChange={(nextValue) => updateValue(index, "copy", nextValue)}
                className="mt-3 p-1 text-sm leading-7 text-muted"
              />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export function ContactPreview({
  formState,
  updateField
}: Pick<Props, "formState" | "updateField">) {
  const social = parseSocialLinksText(formState.socialLinksText);

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
                  <Icon className="h-4 w-4 shrink-0 text-accent" />
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
                className="text-muted/70 rounded-2xl border border-line bg-panel px-4 py-3 text-sm"
              >
                {label}
              </div>
            ))}
          </div>
          <div className="text-muted/70 mt-3 min-h-28 rounded-3xl border border-line bg-panel px-4 py-3 text-sm">
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
