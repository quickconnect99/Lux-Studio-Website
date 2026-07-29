import assert from "node:assert/strict";
import test from "node:test";
import {
  buildUniqueSlugSuggestion,
  createEmptyProject,
  createProjectTemplate,
  formatFileSize,
  getProjectCompletionIssues,
  slugify
} from "../lib/admin-utils";

test("creates stable URL slugs including common accented characters", () => {
  assert.equal(slugify("  Porsche Zürich — Launch  "), "porsche-zurich-launch");
  assert.equal(slugify("///"), "");
});

test("finds the next available slug without mutating the source list", () => {
  const existing = ["project", "project-2", "project-3"];

  assert.equal(buildUniqueSlugSuggestion("Project", existing), "project-4");
  assert.deepEqual(existing, ["project", "project-2", "project-3"]);
  assert.equal(buildUniqueSlugSuggestion("", [], "untitled"), "untitled");
});

test("reports project completion issues and accounts for queued media", () => {
  const state = {
    ...createEmptyProject(),
    title: "Complete project",
    slug: "complete-project",
    shortDescription: "Short",
    fullDescription: "Full",
    category: "Brand Film",
    location: "Zurich",
    year: "2026",
    coverImage: "",
    galleryImagesText: ""
  };

  assert.deepEqual(
    getProjectCompletionIssues(state, {
      hasQueuedCover: true,
      queuedGalleryCount: 1
    }),
    []
  );
  assert.deepEqual(
    getProjectCompletionIssues(
      { ...state, year: "1899" },
      { hasQueuedCover: false, queuedGalleryCount: 0 }
    ),
    ["valid year", "cover image", "at least one gallery image"]
  );
});

test("creates distinct editable templates with stable admin keys", () => {
  const automotive = createProjectTemplate("Automotive");
  const hospitality = createProjectTemplate("Hospitality");

  assert.equal(automotive.adminKey, "template:automotive");
  assert.equal(automotive.templateBusiness, "Automotive");
  assert.equal(hospitality.adminKey, "template:hospitality");
  assert.notEqual(automotive.coverImage, hospitality.coverImage);
});

test("formats file sizes defensively", () => {
  assert.equal(formatFileSize(Number.NaN), "0 B");
  assert.equal(formatFileSize(0), "0 B");
  assert.equal(formatFileSize(1536), "1.5 KB");
});
