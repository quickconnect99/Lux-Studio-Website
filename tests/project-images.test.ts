import assert from "node:assert/strict";
import test from "node:test";
import {
  buildFrameItems,
  buildProjectFrameItems,
  normalizeProjectGallery,
  serializeFrameItem
} from "../lib/project-images";

test("normalizeProjectGallery pairs each image with its own caption and alt text", () => {
  const gallery = normalizeProjectGallery({
    coverImage: "/cover.jpg",
    galleryImages: ["/cover.jpg", " /one.jpg ", "/one.jpg", "/two.jpg"],
    galleryCaptions: ["cover", "first", "duplicate", "second"],
    galleryAlts: ["cover alt", "first alt", "duplicate alt", ""]
  });

  assert.deepEqual(gallery.images, ["/one.jpg", "/two.jpg"]);
  assert.deepEqual(gallery.captions, ["first", "second"]);
  assert.deepEqual(gallery.alts, ["first alt", ""]);
  assert.deepEqual(gallery.items, [
    { image: "/one.jpg", caption: "first", alt: "first alt" },
    { image: "/two.jpg", caption: "second", alt: undefined }
  ]);
});

test("normalizeProjectGallery defaults alt text to empty when omitted", () => {
  const gallery = normalizeProjectGallery({
    coverImage: "",
    galleryImages: ["/one.jpg"],
    galleryCaptions: ["Caption"]
  });

  assert.deepEqual(gallery.alts, [""]);
  assert.equal(gallery.items[0].alt, undefined);
});

test("preserves internal project links in serialized frame selections", () => {
  const entry = "/images/still.jpg | /work/project-one";
  const [frame] = buildFrameItems({
    selectedFrames: [entry],
    fallbackImages: [],
    galleryImages: []
  });

  assert.deepEqual(frame, {
    image: "/images/still.jpg",
    href: "/work/project-one"
  });
  assert.equal(
    serializeFrameItem(frame),
    '{"image":"/images/still.jpg","href":"/work/project-one"}'
  );
  assert.deepEqual(
    buildFrameItems({
      selectedFrames: [serializeFrameItem(frame)],
      fallbackImages: [],
      galleryImages: []
    }),
    [frame]
  );
});

test("ignores malformed structured frame data and keeps legacy fallbacks", () => {
  const frames = buildFrameItems({
    selectedFrames: [
      '{"image":"javascript:alert(1)","href":"/work/project"}',
      "/images/legacy.jpg -> /work/legacy"
    ],
    fallbackImages: [],
    galleryImages: []
  });

  assert.deepEqual(frames, [
    { image: "/images/legacy.jpg", href: "/work/legacy" }
  ]);
});

test("keeps duplicate image URLs attached to their explicit projects", () => {
  const projects = [
    {
      title: "Project One",
      slug: "project-one",
      coverImage: "/images/shared.jpg",
      galleryImages: []
    },
    {
      title: "Project Two",
      slug: "project-two",
      coverImage: "/images/shared.jpg",
      galleryImages: []
    }
  ];
  const frames = buildProjectFrameItems(projects, [
    "/images/shared.jpg | /work/project-two",
    "/images/shared.jpg | /work/project-one"
  ]);

  assert.deepEqual(
    frames.map((frame) => frame.href),
    ["/work/project-two", "/work/project-one"]
  );
  assert.deepEqual(
    frames.map((frame) => frame.projectTitle),
    ["Project Two", "Project One"]
  );
});
