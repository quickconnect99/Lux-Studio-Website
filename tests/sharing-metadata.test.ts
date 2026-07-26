import assert from "node:assert/strict";
import test from "node:test";
import { projects } from "../lib/content";
import { DEFAULT_PROJECT_IMAGE, defaultSiteSettings } from "../lib/site-config";
import {
  buildSharingMetadata,
  resolveSharingImage
} from "../lib/sharing-metadata";

test("selects a page image before project and general fallbacks", () => {
  assert.equal(
    resolveSharingImage({
      preferredImages: ["", "/images/page-specific.jpg"],
      projects,
      settings: defaultSiteSettings
    }),
    "/images/page-specific.jpg"
  );
});

test("uses the first project cover when no page image is supplied", () => {
  assert.equal(
    resolveSharingImage({ projects, settings: defaultSiteSettings }),
    projects[0].coverImage
  );
  assert.equal(resolveSharingImage(), DEFAULT_PROJECT_IMAGE);
});

test("builds matching Open Graph and Twitter sharing images", () => {
  const image = "/images/project-cover.jpg";
  const metadata = buildSharingMetadata({
    title: "Project | Lux Studio",
    description: "Project description",
    image,
    imageAlt: "Project first still",
    siteName: "Lux Studio",
    type: "article"
  });

  assert.deepEqual(metadata.openGraph?.images, [
    { url: image, alt: "Project first still" }
  ]);
  assert.deepEqual(metadata.twitter?.images, [image]);
});
