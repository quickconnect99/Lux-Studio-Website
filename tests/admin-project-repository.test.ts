import assert from "node:assert/strict";
import test from "node:test";
import {
  mergeAdminProjectList,
  removeAdminProjectFromList
} from "../lib/admin-project-repository";
import type { AdminProjectListItem } from "../lib/admin-types";

function project(
  slug: string,
  overrides: Partial<AdminProjectListItem> = {}
): AdminProjectListItem {
  return {
    adminKey: `project:${slug}`,
    business: "Automotive",
    title: slug,
    slug,
    shortDescription: "Short",
    fullDescription: "Full",
    category: "Brand Film",
    carModel: "Model",
    location: "Location",
    year: 2026,
    coverImage: "/cover.jpg",
    galleryImages: [],
    featured: false,
    published: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides
  };
}

test("merges saved projects by id or slug without dropping other local drafts", () => {
  const firstLocal = project("first-local");
  const secondLocal = project("second-local");
  const saved = project("first-local", {
    title: "Updated local"
  });

  const next = mergeAdminProjectList([firstLocal, secondLocal], saved);

  assert.equal(next.length, 2);
  assert.equal(next[0].title, "Updated local");
  assert.equal(next[1].slug, "second-local");
});

test("sorts remotely saved projects newest first", () => {
  const older = project("older", {
    id: "older-id",
    createdAt: "2025-01-01T00:00:00.000Z"
  });
  const newer = project("newer", {
    id: "newer-id",
    createdAt: "2026-01-01T00:00:00.000Z"
  });

  const next = mergeAdminProjectList([older], newer, {
    sortByCreatedAt: true
  });

  assert.deepEqual(
    next.map((entry) => entry.slug),
    ["newer", "older"]
  );
});

test("removes only the selected database project", () => {
  const first = project("first", { id: "first-id" });
  const second = project("second", { id: "second-id" });

  assert.deepEqual(removeAdminProjectFromList([first, second], "first-id"), [
    second
  ]);
});
