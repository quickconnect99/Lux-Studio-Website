import assert from "node:assert/strict";
import test from "node:test";
import {
  buildLocalProject,
  buildProjectDatabasePayload,
  buildSiteSettingsDatabasePayload,
  findIncompleteTeamMember,
  getOversizedFiles,
  getProjectMediaState,
  restoreProjectDraft
} from "../lib/admin-persistence";
import {
  formatServicesText,
  formatSocialLinksText,
  formatValuesText,
  parseServicesText,
  parseSocialLinksText,
  parseValuesText
} from "../lib/admin-utils";
import { normalizeMotionFrames } from "../lib/supabase";
import {
  createEmptyProject,
  toSiteSettingsFormState
} from "../lib/admin-utils";
import { defaultSiteSettings } from "../lib/site-config";
import {
  buildLocalProjectSaveReport,
  buildRemoteProjectSaveReport,
  buildSiteSettingsSaveReport,
  withAdminSaveWarnings
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
    galleryAlts: ["", ""],
    uploadedVideo: ""
  });
});

test("keeps captions paired with their own image across a blank gallery line", () => {
  const formState = {
    ...createEmptyProject(),
    coverImage: "/cover.jpg",
    // A blank line between two image URLs must not shift "second" onto
    // "/one.jpg" once the blank line is dropped during normalization.
    galleryImagesText: "/one.jpg\n\n/two.jpg",
    galleryCaptionsText: "first\nblank line has no image\nsecond"
  };

  assert.deepEqual(getProjectMediaState(formState), {
    coverImage: "/cover.jpg",
    galleryImages: ["/one.jpg", "/two.jpg"],
    galleryCaptions: ["first", "second"],
    galleryAlts: ["", ""],
    uploadedVideo: ""
  });
});

test("carries independent alt text through to both save payloads without touching captions", () => {
  const formState = {
    ...createEmptyProject(),
    coverImage: "/cover.jpg",
    galleryImagesText: "/one.jpg\n/two.jpg",
    galleryCaptionsText: "Caption one\nCaption two",
    galleryAltsText: "Alt one\n"
  };
  const media = getProjectMediaState(formState);

  assert.deepEqual(media.galleryAlts, ["Alt one", ""]);
  assert.deepEqual(media.galleryCaptions, ["Caption one", "Caption two"]);

  const database = buildProjectDatabasePayload({
    formState,
    slug: "project",
    media
  });
  const local = buildLocalProject({ formState, slug: "project", media });

  assert.deepEqual(database.gallery_items, [
    { image: "/one.jpg", caption: "Caption one", alt: "Alt one" },
    { image: "/two.jpg", caption: "Caption two", alt: undefined }
  ]);
  assert.deepEqual(local.galleryItems, database.gallery_items);
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
  formState.socialLinks = [
    { label: "Instagram", href: "https://instagram.com/lux" }
  ];
  formState.aboutValues = [{ title: "Precision", copy: "Measured decisions" }];
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

test("persists an intentionally empty Frames in Motion selection", () => {
  const formState = toSiteSettingsFormState(defaultSiteSettings);
  formState.motionFramesText = "";
  const payload = buildSiteSettingsDatabasePayload(formState);

  assert.deepEqual(payload.motion_frames, []);
  assert.deepEqual(normalizeMotionFrames(payload.motion_frames), []);
});

test("requires a name and portrait for partially completed team members", () => {
  const member = {
    name: "Jamie Doe",
    title: "Producer",
    position: "Production",
    description: "Coordinates the production.",
    image: ""
  };

  assert.deepEqual(findIncompleteTeamMember([member]), {
    index: 0,
    missing: ["portrait"]
  });
  assert.equal(findIncompleteTeamMember([member], [0]), null);
  assert.equal(
    findIncompleteTeamMember([
      { name: "", title: "", position: "", description: "", image: "" }
    ]),
    null
  );
});

test("round-trips escaped delimiters in structured settings text", () => {
  const social = [
    { label: "Studio | Instagram", href: "https://example.com/a|b" }
  ];
  const values = [{ title: "Calm | Precise", copy: "Film | Photography" }];
  const services = [
    {
      number: "01",
      title: "Film | Stills",
      description: "One shoot | multiple formats",
      deliverables: ["Hero film", "Stills"]
    }
  ];

  assert.deepEqual(parseSocialLinksText(formatSocialLinksText(social)), social);
  assert.deepEqual(parseValuesText(formatValuesText(values)), values);
  assert.deepEqual(parseServicesText(formatServicesText(services)), services);
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
  assert.equal(local.items[0].detail, "Session only");

  const unconfiguredLocal = buildLocalProjectSaveReport({
    coverFile: null,
    galleryFiles: [],
    videoFile: null
  });
  assert.equal(unconfiguredLocal.items[0].detail, "Session only");
  assert.match(unconfiguredLocal.items[0].label, /browser session/i);
});

test("builds site settings reports and shared follow-up warnings", () => {
  const report = buildSiteSettingsSaveReport({
    heroVideoFile: { name: "hero.mp4" } as File,
    selectedFrameFiles: [{ name: "frame.jpg" }] as File[],
    aboutTeamGalleryFiles: [],
    aboutTeamMemberImageFiles: [],
    cleanupCompleted: false,
    publicRefreshCompleted: true
  });
  const projectReport = withAdminSaveWarnings(
    {
      title: "Saved",
      items: [{ id: "project", label: "Project", tone: "success" }]
    },
    { cleanupCompleted: true, publicRefreshCompleted: false }
  );

  assert.deepEqual(
    report.items.map((item) => item.id),
    ["site-settings", "hero-video", "selected-frames", "media-cleanup"]
  );
  assert.deepEqual(
    projectReport.items.map((item) => item.id),
    ["project", "public-refresh"]
  );
});
