"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { updateCopySection } from "@/components/admin/site-settings-copy";
import { type SiteSettingsEditorProps as Props } from "@/components/admin/site-settings-editor-types";
import { GalleryEditor } from "@/components/admin/gallery-editor";
import { InlineText } from "@/components/admin/site-settings-inline-text";
import { SiteSettingsPageHeader } from "@/components/admin/site-settings-page-header";
import { parseMultilineInput } from "@/lib/admin-utils";

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
  const [previewUrl] = useState(() =>
    queuedFile ? URL.createObjectURL(queuedFile) : null
  );

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

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

export function SiteSettingsAboutPreview({
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
  const values = formState.aboutValues;
  const teamMembers = formState.aboutTeamMembers;
  const teamGallery = parseMultilineInput(formState.aboutTeamGalleryText);

  function updateTeamGallery(images: string[]) {
    updateField("aboutTeamGalleryText", images.join("\n"));
  }

  function updateValue(index: number, key: "title" | "copy", value: string) {
    const next = [...values];
    next[index] = { ...next[index], [key]: value };
    updateField("aboutValues", next);
  }

  function addValue() {
    updateField("aboutValues", [...values, { title: "New value", copy: "" }]);
  }

  function removeValue(index: number) {
    updateField(
      "aboutValues",
      values.filter((_, valueIndex) => valueIndex !== index)
    );
  }

  function moveValue(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= values.length) return;
    const next = [...values];
    const [value] = next.splice(index, 1);
    next.splice(target, 0, value);
    updateField("aboutValues", next);
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
              <div className="mb-3 flex justify-end gap-1">
                <button
                  type="button"
                  onClick={() => moveValue(index, -1)}
                  disabled={index === 0}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:bg-panel hover:text-foreground disabled:opacity-35"
                  aria-label={`Move ${value.title} up`}
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveValue(index, 1)}
                  disabled={index === values.length - 1}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:bg-panel hover:text-foreground disabled:opacity-35"
                  aria-label={`Move ${value.title} down`}
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeValue(index)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:bg-panel hover:text-error-text"
                  aria-label={`Remove ${value.title}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <InlineText
                value={value.title}
                placeholder="Value title"
                ariaLabel={`Value ${index + 1} title`}
                onChange={(nextValue) => updateValue(index, "title", nextValue)}
                className="p-1 text-[0.62rem] uppercase tracking-eyebrow text-accent-text"
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
        <button type="button" onClick={addValue} className="control-pill mt-4">
          <Plus className="h-3.5 w-3.5" />
          Add value
        </button>
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
                        key={
                          queued
                            ? `${queued.file.name}-${queued.file.size}-${queued.file.lastModified}`
                            : member.image
                        }
                        image={member.image}
                        name={member.name}
                        queuedFile={queued?.file}
                      />
                    </div>
                    {queued ? (
                      <p className="border-accent/30 bg-accent/10 rounded-xl border px-3 py-2 text-[0.62rem] leading-5 text-accent-text">
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
                          className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-panel text-muted transition-colors hover:text-error-text"
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
                className="flex min-h-40 w-full items-center justify-center rounded-[1.75rem] border border-dashed border-line text-xs uppercase tracking-ui text-muted transition-colors hover:border-accent hover:text-accent-text"
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
