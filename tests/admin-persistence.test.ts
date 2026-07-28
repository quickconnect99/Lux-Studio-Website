import assert from "node:assert/strict";
import test from "node:test";
import {
  buildLocalProject,
  buildProjectDatabasePayload,
  buildSiteSettingsDatabasePayload,
  getOversizedFiles,
  getProjectMediaState,
  restoreProjectDraft
} from "../lib/admin-persistence";
import {
  createEmptyProject,
  toSiteSettingsFormState
} from "../lib/admin-utils";
import { defaultSiteSettings } from "../lib/site-config";
import {
  buildLocalProjectSaveReport,
  buildRemoteProjectSaveReport
} from "../lib/admin-save-report";

test("restores drafts with safe defaults and a valid business", () => {
  assert.equal(restoreProjectDraft(null), null);

  const restored = restoreProjectDraft({
    title: "Saved draft",
    business: "invalid",
    year: "2025"
  });

  assert.equal(restored?.title, "Saved draft");
  assert.equal(restored?.business, "Automotive");
  assert.equal(restored?.year, "2025");
  assert.equal(restored?.slug, createEmptyProject().slug);
});

test("normalizes project media and excludes the cover from the gallery", () => {
  const formState = {
    ...createEmptyProject(),
    coverImage: "/cover.jpg",
    galleryImagesText: "/cover.jpg\n /one.jpg \n/one.jpg\n/two.jpg",
    galleryCaptionsText: "cover\nfirst\nduplicate\nsecond"
  };

  assert.deepEqual(getProjectMediaState(formState), {
    coverImage: "/cover.jpg",
    galleryImages: ["/one.jpg", "/two.jpg"],
    galleryCaptions: ["first", "second"],
    uploadedVideo: ""
  });
});

test("builds equivalent database and local project records", () => {
  const formState = {
    ...createEmptyProject(),
    id: "project-id",
    title: "Project",
    year: "2026",
    createdAt: "2026-01-02T03:04:05.000Z",
    behindTheScenes: ""
  };
  const media = getProjectMediaState(formState, {
    coverImage: "/cover.jpg",
    galleryImages: ["/gallery.jpg"],
    galleryCaptions: ["Gallery"],
    uploadedVideo: "/video.mp4"
  });

  const database = buildProjectDatabasePayload({
    formState,
    slug: "project",
    media
  });
  const local = buildLocalProject({
    formState,
    slug: "project",
    media
  });

  assert.equal(database.id, local.id);
  assert.equal(database.cover_image, local.coverImage);
  assert.deepEqual(database.gallery_images, local.galleryImages);
  assert.equal(database.uploaded_video, local.uploadedVideo);
  assert.equal(database.behind_the_scenes, null);
  assert.equal(local.behindTheScenes, undefined);
});

test("serializes site settings and file limits", () => {
  const formState = toSiteSettingsFormState(defaultSiteSettings);
  formState.socialLinksText = "Instagram | https://instagram.com/lux";
  formState.aboutValuesText = "Precision | Measured decisions";
  formState.aboutTeamGalleryText =
    "/images/team-gallery-01.jpg\n/images/team-gallery-02.jpg";
  formState.aboutTeamMembers = formState.aboutTeamMembers.map(
    (member, index) =>
      index === 0
        ? { ...member, image: "/images/team-portrait-01.jpg" }
        : member
  );
  formState.motionFramesText =
    "/images/project-motion-01.jpg\n/images/project-motion-02.jpg";

  const payload = buildSiteSettingsDatabasePayload(formState);

  assert.equal(payload.id, "global");
  assert.deepEqual(payload.social_links, [
    { label: "Instagram", href: "https://instagram.com/lux" }
  ]);
  assert.deepEqual(payload.about_values, [
    { title: "Precision", copy: "Measured decisions" }
  ]);
  assert.deepEqual(payload.about_team_images, [
    "/images/team-gallery-01.jpg",
    "/images/team-gallery-02.jpg"
  ]);
  assert.deepEqual(payload.motion_frames, [
    "/images/project-motion-01.jpg",
    "/images/project-motion-02.jpg"
  ]);
  assert.equal(
    payload.about_team_members[0]?.image,
    "/images/team-portrait-01.jpg"
  );
  assert.deepEqual(getOversizedFiles([{ size: 10 }, { size: 11 }], 10), [
    { size: 11 }
  ]);
});

test("builds remote and local save reports from queued media", () => {
  const coverFile = { size: 2_048 } as File;
  const galleryFiles = [{ size: 1_024 }, { size: 3_072 }] as File[];

  const remote = buildRemoteProjectSaveReport({
    isTemplateSource: false,
    coverFile,
    galleryFiles,
    videoFile: null
  });
  const local = buildLocalProjectSaveReport({
    isSupabaseConfigured: true,
    coverFile,
    galleryFiles,
    videoFile: null
  });

  assert.deepEqual(
    remote.items.map((item) => item.id),
    ["project", "cover", "gallery"]
  );
  assert.deepEqual(
    local.items.map((item) => item.id),
    ["project", "cover-warning", "gallery-warning"]
  );
});
