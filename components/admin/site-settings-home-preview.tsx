"use client";

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
import { parseMultilineInput } from "@/lib/admin-utils";
import { serializeFrameItem, type FrameItem } from "@/lib/project-images";

export function SiteSettingsHomePreview({
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
                className="ml-6 px-2 text-accent-text sm:ml-12"
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
