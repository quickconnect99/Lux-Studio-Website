import assert from "node:assert/strict";
import test from "node:test";
import {
  buildFrameItems,
  buildProjectFrameItems,
  serializeFrameItem
} from "../lib/project-images";

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
  assert.equal(serializeFrameItem(frame), entry);
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
