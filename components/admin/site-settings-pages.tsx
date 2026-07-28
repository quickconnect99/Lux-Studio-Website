"use client";

import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Mail,
  MapPin,
  Phone,
  Plus,
  Trash2,
  Upload
} from "lucide-react";
import Image from "next/image";
import { updateCopySection } from "@/components/admin/site-settings-copy";
import { type SiteSettingsEditorProps as Props } from "@/components/admin/site-settings-editor-types";
import { GalleryEditor } from "@/components/admin/gallery-editor";
import {
  getFrameKey,
  hydrateFrameItems,
  ProjectFrameLibrary,
  reorderFrameItems,
  type AvailableProjectFrame
} from "@/components/admin/project-frame-library";
import { InlineText } from "@/components/admin/site-settings-inline-text";
import { SiteSettingsPageHeader } from "@/components/admin/site-settings-page-header";
import {
  formatServicesText,
  formatValuesText,
  parseMultilineInput,
  parseServicesText,
  parseSocialLinksText,
  parseValuesText
} from "@/lib/admin-utils";
import { serializeFrameItem, type FrameItem } from "@/lib/project-images";

export function HomePreview({
  projects = [],
  formState,
  updateField,
  selectedFrameFiles = [],
  addSelectedFrameFiles,
  removeSelectedFrameFile
}: Pick<
  Props,
  | "projects"
  | "formState"
  | "updateField"
  | "selectedFrameFiles"
  | "addSelectedFrameFiles"
  | "removeSelectedFrameFile"
>) {
  const selectedFrameEntries = parseMultilineInput(
    formState.selectedFramesText
  );
  const motionFrameEntries = parseMultilineInput(formState.motionFramesText);
  const availableProjectFrames: AvailableProjectFrame[] = projects
    .filter((project) => project.published && !project.isTemplate)
    .flatMap((project) => {
      const seen = new Set<string>();

      return [project.coverImage, ...project.galleryImages]
        .map((image) => image.trim())
        .filter((image) => {
          if (!image || seen.has(image)) return false;
          seen.add(image);
          return true;
        })
        .map((image) => ({
          image,
          href: `/work/${encodeURIComponent(project.slug)}`,
          alt: `${project.title} project still`,
          projectTitle: project.title
        }));
    });
  const selectedFrameItems = hydrateFrameItems(
    selectedFrameEntries,
    availableProjectFrames
  );
  const motionFrameItems = hydrateFrameItems(
    motionFrameEntries,
    availableProjectFrames
  );
  const selectedFrames = selectedFrameItems.map((frame) => frame.image);
  const motionFrames = motionFrameItems.map((frame) => frame.image);

  function handleSelectedFramesChange(images: string[]) {
    updateField(
      "selectedFramesText",
      reorderFrameItems(images, selectedFrameItems).join("\n")
    );
  }

  function handleMotionFramesChange(images: string[]) {
    updateField(
      "motionFramesText",
      reorderFrameItems(images, motionFrameItems).join("\n")
    );
  }

  function toggleFrame(
    field: "selectedFramesText" | "motionFramesText",
    currentItems: FrameItem[],
    frame: AvailableProjectFrame
  ) {
    const selected = currentItems.some(
      (item) =>
        getFrameKey(item) === getFrameKey(frame) ||
        (!item.href && item.image === frame.image)
    );
    const nextItems = selected
      ? currentItems.filter(
          (item) =>
            getFrameKey(item) !== getFrameKey(frame) &&
            !(!item.href && item.image === frame.image)
        )
      : [...currentItems, frame];

    updateField(field, nextItems.map(serializeFrameItem).join("\n"));
  }

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
            <div className="space-y-1 font-[family-name:var(--font-display)] text-[clamp(3rem,7vw,6.5rem)] uppercase leading-[0.88] tracking-[-0.04em]">
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
                poster={selectedFrames[0]}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-cover opacity-55"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/75" />
            <div className="absolute bottom-8 left-8 z-10">
              <div className="font-[family-name:var(--font-display)] text-4xl uppercase leading-none">
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

      <section className="px-6 py-10 sm:px-10">
        <div className="panel-2xl p-7">
          <p className="text-xs uppercase tracking-eyebrow text-muted">
            Shot With Intent
          </p>
          <p className="mt-2 max-w-2xl text-xs leading-5 text-muted">
            These images control the large homepage gallery. Frame 01 is shown
            first; the list is independent from Frames in Motion.
          </p>
          <div className="mt-5">
            <GalleryEditor
              key={`selected-frames-${selectedFrameEntries.join("|")}`}
              images={selectedFrames}
              captions={[]}
              pendingFiles={selectedFrameFiles}
              onImagesChange={handleSelectedFramesChange}
              onFilesAdd={addSelectedFrameFiles ?? (() => undefined)}
              onFileRemove={removeSelectedFrameFile ?? (() => undefined)}
              introText="Order controls the large Shot With Intent carousel."
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
          </div>
          <ProjectFrameLibrary
            frames={availableProjectFrames}
            selectedItems={selectedFrameItems}
            onToggle={(frame) =>
              toggleFrame("selectedFramesText", selectedFrameItems, frame)
            }
            emptyCopy="Publish project images first to build the Shot With Intent library."
          />
        </div>
      </section>

      <section className="px-6 py-10 sm:px-10">
        <div className="panel-2xl p-7">
          <p className="text-xs uppercase tracking-eyebrow text-muted">
            Frames in Motion
          </p>
          <p className="mt-2 max-w-2xl text-xs leading-5 text-muted">
            Select and order the smaller moving frames independently. There is
            no eight-image limit, and every project image keeps its project
            link.
          </p>

          <div className="mt-5">
            <GalleryEditor
              key={`motion-frames-${motionFrameEntries.join("|")}`}
              images={motionFrames}
              captions={[]}
              pendingFiles={[]}
              onImagesChange={handleMotionFramesChange}
              onFilesAdd={() => undefined}
              onFileRemove={() => undefined}
              introText="Drag selected project frames into the order used by the moving strip."
              showAddControls={false}
              itemLabel="Motion frame"
              getFrameRole={(index) => {
                const projectTitle = motionFrameItems[index]?.projectTitle;

                return {
                  label: projectTitle ?? "Project frame",
                  description: projectTitle
                    ? `Links to the ${projectTitle} project.`
                    : "Keep this image in a published project to preserve its link."
                };
              }}
            />
          </div>

          <ProjectFrameLibrary
            frames={availableProjectFrames}
            selectedItems={motionFrameItems}
            onToggle={(frame) =>
              toggleFrame("motionFramesText", motionFrameItems, frame)
            }
            emptyCopy="Publish project images first to build the Frames in Motion library."
          />
        </div>
      </section>

      <section className="px-6 py-10 sm:px-10">
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
          <div className="mt-5 font-[family-name:var(--font-display)] text-4xl uppercase leading-none">
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
      </section>
    </>
  );
}

export function WorkPreview({
  formState,
  updateField
}: Pick<Props, "formState" | "updateField">) {
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
          The project list for this page is managed in the Projects area of the
          admin dashboard, not here.
        </p>
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
              className="w-fit p-2 font-[family-name:var(--font-mono)] text-sm text-accent"
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

// Object URL preview for a queued (not-yet-uploaded) team portrait — without
// this, the thumbnail only updates after the file has been saved to Supabase.
function TeamMemberPortrait({
  image,
  name,
  queuedFile
}: {
  image: string;
  name: string;
  queuedFile?: File;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!queuedFile) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(queuedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [queuedFile]);

  const src = previewUrl ?? image;

  if (!src) {
    return (
      <div className="flex h-full items-center justify-center px-4 text-center text-[0.62rem] uppercase tracking-meta text-muted">
        No image
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={`${name || "Team member"} portrait`}
      fill
      sizes="180px"
      unoptimized
      className="object-cover"
    />
  );
}

export function AboutPreview({
  formState,
  updateField,
  aboutTeamGalleryFiles = [],
  aboutTeamMemberImageFiles = [],
  addAboutTeamGalleryFiles,
  removeAboutTeamGalleryFile,
  setAboutTeamMemberImageFile
}: Pick<
  Props,
  | "formState"
  | "updateField"
  | "aboutTeamGalleryFiles"
  | "aboutTeamMemberImageFiles"
  | "addAboutTeamGalleryFiles"
  | "removeAboutTeamGalleryFile"
  | "setAboutTeamMemberImageFile"
>) {
  const values = parseValuesText(formState.aboutValuesText);
  const teamMembers = formState.aboutTeamMembers;
  const teamGallery = parseMultilineInput(formState.aboutTeamGalleryText);

  function updateTeamGallery(images: string[]) {
    updateField("aboutTeamGalleryText", images.join("\n"));
  }

  function updateValue(index: number, key: "title" | "copy", value: string) {
    const next = [...values];
    next[index] = { ...next[index], [key]: value };
    updateField("aboutValuesText", formatValuesText(next));
  }

  function updateTeamMember(
    index: number,
    key: keyof (typeof teamMembers)[number],
    value: string
  ) {
    const next = [...teamMembers];
    next[index] = { ...next[index], [key]: value };
    updateField("aboutTeamMembers", next);
  }

  function addTeamMember() {
    updateField("aboutTeamMembers", [
      ...teamMembers,
      {
        name: "New team member",
        title: "",
        position: "",
        description: "",
        image: ""
      }
    ]);
  }

  function removeTeamMember(index: number) {
    const next = teamMembers.filter((_, memberIndex) => memberIndex !== index);
    updateField("aboutTeamMembers", next);
  }

  function moveTeamMember(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= teamMembers.length) return;
    const next = [...teamMembers];
    const [member] = next.splice(index, 1);
    next.splice(target, 0, member);
    updateField("aboutTeamMembers", next);
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
        <div className="panel-2xl mt-5 p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-eyebrow text-muted">
                Team Members
              </p>
              <p className="mt-2 max-w-2xl text-xs leading-5 text-muted">
                Each entry appears as its own team tab on the About page. You
                can add as many members as needed.
              </p>
            </div>
            <button
              type="button"
              onClick={addTeamMember}
              className="control-pill"
            >
              <Plus className="h-3.5 w-3.5" />
              Add member
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {teamMembers.map((member, index) => {
              const queued = aboutTeamMemberImageFiles.find(
                (item) => item.index === index
              );

              return (
                <div
                  key={`${member.name}-${index}`}
                  className="grid gap-5 rounded-[1.75rem] border border-line bg-panel-secondary p-5 lg:grid-cols-[180px_1fr]"
                >
                  <div className="space-y-3">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] border border-line bg-panel-dark">
                      <TeamMemberPortrait
                        image={member.image}
                        name={member.name}
                        queuedFile={queued?.file}
                      />
                    </div>
                    {queued ? (
                      <p className="border-accent/30 bg-accent/10 rounded-xl border px-3 py-2 text-[0.62rem] leading-5 text-accent">
                        Queued: {queued.file.name}
                      </p>
                    ) : null}
                    <label className="control-pill w-full cursor-pointer justify-center">
                      <Upload className="h-3.5 w-3.5" />
                      Upload portrait
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(event) =>
                          setAboutTeamMemberImageFile?.(
                            index,
                            event.target.files?.[0] ?? null
                          )
                        }
                      />
                    </label>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-[0.62rem] uppercase tracking-eyebrow text-muted">
                        Member {String(index + 1).padStart(2, "0")}
                      </p>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => moveTeamMember(index, -1)}
                          disabled={index === 0}
                          className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-panel text-muted transition-colors hover:text-foreground disabled:opacity-35"
                          aria-label="Move member up"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveTeamMember(index, 1)}
                          disabled={index === teamMembers.length - 1}
                          className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-panel text-muted transition-colors hover:text-foreground disabled:opacity-35"
                          aria-label="Move member down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeTeamMember(index)}
                          className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-panel text-muted transition-colors hover:text-error"
                          aria-label="Remove member"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block space-y-2 text-xs uppercase tracking-meta text-muted">
                        Name
                        <input
                          value={member.name}
                          onChange={(event) =>
                            updateTeamMember(index, "name", event.target.value)
                          }
                          className="input-field text-sm normal-case tracking-normal"
                        />
                      </label>
                      <label className="block space-y-2 text-xs uppercase tracking-meta text-muted">
                        Title
                        <input
                          value={member.title}
                          onChange={(event) =>
                            updateTeamMember(index, "title", event.target.value)
                          }
                          className="input-field text-sm normal-case tracking-normal"
                        />
                      </label>
                      <label className="block space-y-2 text-xs uppercase tracking-meta text-muted">
                        Position
                        <input
                          value={member.position}
                          onChange={(event) =>
                            updateTeamMember(
                              index,
                              "position",
                              event.target.value
                            )
                          }
                          className="input-field text-sm normal-case tracking-normal"
                        />
                      </label>
                      <label className="block space-y-2 text-xs uppercase tracking-meta text-muted">
                        Image URL
                        <input
                          value={member.image}
                          onChange={(event) =>
                            updateTeamMember(index, "image", event.target.value)
                          }
                          className="input-field text-sm normal-case tracking-normal"
                          placeholder="https://... or /images/..."
                        />
                      </label>
                    </div>
                    <label className="block space-y-2 text-xs uppercase tracking-meta text-muted">
                      Member Description
                      <textarea
                        value={member.description}
                        onChange={(event) =>
                          updateTeamMember(
                            index,
                            "description",
                            event.target.value
                          )
                        }
                        className="textarea-field min-h-28 text-sm normal-case leading-6 tracking-normal"
                      />
                    </label>
                  </div>
                </div>
              );
            })}

            {teamMembers.length === 0 ? (
              <button
                type="button"
                onClick={addTeamMember}
                className="flex min-h-40 w-full items-center justify-center rounded-[1.75rem] border border-dashed border-line text-xs uppercase tracking-ui text-muted transition-colors hover:border-accent hover:text-accent"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add first team member
              </button>
            ) : null}
          </div>
        </div>

        <div className="panel-2xl mt-5 p-7">
          <p className="text-xs uppercase tracking-eyebrow text-muted">
            Team Gallery
          </p>
          <p className="mt-2 max-w-2xl text-xs leading-5 text-muted">
            These photos appear as a separate gallery below the team members on
            the About page. Profile portraits remain managed per member above.
          </p>
          <div className="mt-5">
            <GalleryEditor
              images={teamGallery}
              captions={[]}
              pendingFiles={aboutTeamGalleryFiles}
              onImagesChange={updateTeamGallery}
              onFilesAdd={addAboutTeamGalleryFiles ?? (() => undefined)}
              onFileRemove={removeAboutTeamGalleryFile ?? (() => undefined)}
              introText="Drag photos to control their order in the public team gallery."
              showCaptions={false}
              itemLabel="Photo"
              getFrameRole={() => ({
                label: "Team gallery",
                description: "Shown in the gallery below the team profiles."
              })}
            />
          </div>
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
