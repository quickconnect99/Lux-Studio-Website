import assert from "node:assert/strict";
import test from "node:test";
import { defaultSiteSettings } from "../lib/site-config";
import {
  buildOrganizationSchema,
  buildPageStructuredData,
  buildProjectVideoSchema
} from "../lib/site-structured-data";

const baseUrl = "https://www.luxstudio.li";

test("omits empty contact and placeholder social fields from organization data", () => {
  const schema = buildOrganizationSchema(defaultSiteSettings, baseUrl);

  assert.equal("telephone" in schema.contactPoint, false);
  assert.equal("sameAs" in schema, false);
  assert.equal(
    schema.logo,
    "https://www.luxstudio.li/images/brand/lux-studio-logo.svg"
  );
});

test("builds a work collection with absolute project URLs", () => {
  const schema = buildPageStructuredData({
    name: "Work",
    description: "Selected work.",
    path: "/work",
    type: "CollectionPage",
    projects: [
      {
        title: "Project",
        slug: "project",
        coverImage: "/images/project.jpg"
      }
    ],
    baseUrl
  });
  const page = schema["@graph"][0];

  assert.ok(page);
  assert.ok("url" in page);
  assert.equal(page.url, "https://www.luxstudio.li/work");
  assert.equal("mainEntity" in page, true);
  if ("mainEntity" in page) {
    assert.deepEqual(page.mainEntity?.itemListElement[0], {
      "@type": "ListItem",
      position: 1,
      name: "Project",
      url: "https://www.luxstudio.li/work/project",
      image: "https://www.luxstudio.li/images/project.jpg"
    });
  }
});

test("uses embedUrl for providers and absolute contentUrl for local videos", () => {
  const baseProject = {
    title: "Project",
    shortDescription: "Description",
    coverImage: "/images/cover.jpg",
    createdAt: "2026-01-01T00:00:00.000Z",
    uploadedVideo: undefined
  };
  const youtube = buildProjectVideoSchema(
    {
      ...baseProject,
      videoUrl: "https://www.youtube.com/watch?v=abc123"
    },
    baseUrl
  );
  const local = buildProjectVideoSchema(
    {
      ...baseProject,
      videoUrl: "/media/project.mp4"
    },
    baseUrl
  );

  assert.equal(
    youtube && "embedUrl" in youtube ? youtube.embedUrl : undefined,
    "https://www.youtube-nocookie.com/embed/abc123?rel=0&modestbranding=1"
  );
  assert.equal("contentUrl" in (youtube ?? {}), false);
  assert.equal(
    local && "contentUrl" in local ? local.contentUrl : undefined,
    "https://www.luxstudio.li/media/project.mp4"
  );
  assert.equal(
    local?.thumbnailUrl,
    "https://www.luxstudio.li/images/cover.jpg"
  );
});
