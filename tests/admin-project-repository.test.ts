import assert from "node:assert/strict";
import test from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  deleteAdminProjectRecord,
  findAdminProjectBySlug,
  loadAdminProjects,
  mergeAdminProjectList,
  removeAdminProjectFromList,
  saveAdminProjectRecord
} from "../lib/admin-project-repository";
import type { AdminProjectListItem } from "../lib/admin-types";
import type { SupabaseProjectRow } from "../lib/supabase";

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

function projectRow(
  overrides: Partial<SupabaseProjectRow> = {}
): SupabaseProjectRow {
  return {
    id: "project-id",
    business: "Automotive",
    title: "Project",
    slug: "project",
    short_description: "Short",
    full_description: "Full",
    category: "Brand Film",
    car_model: "Model",
    location: "Zurich",
    year: 2026,
    cover_image: "/cover.jpg",
    gallery_images: ["/gallery.jpg"],
    gallery_captions: ["Gallery"],
    gallery_items: null,
    video_url: null,
    uploaded_video: null,
    featured: false,
    published: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-02T00:00:00.000Z",
    behind_the_scenes: null,
    ...overrides
  };
}

function createRepositoryClient(
  data: unknown,
  events: Array<[string, unknown?]>
) {
  const result = { data, error: null };
  const query = {
    select(columns: string) {
      events.push(["select", columns]);
      return query;
    },
    order(column: string) {
      events.push(["order", column]);
      return Promise.resolve(result);
    },
    eq(column: string, value: unknown) {
      events.push([`eq:${column}`, value]);
      return query;
    },
    neq(column: string, value: unknown) {
      events.push([`neq:${column}`, value]);
      return query;
    },
    insert(payload: unknown) {
      events.push(["insert", payload]);
      return query;
    },
    update(payload: unknown) {
      events.push(["update", payload]);
      return query;
    },
    delete() {
      events.push(["delete"]);
      return query;
    },
    maybeSingle() {
      events.push(["maybeSingle"]);
      return Promise.resolve(result);
    },
    single() {
      events.push(["single"]);
      return Promise.resolve(result);
    }
  };

  return {
    from(table: string) {
      events.push(["from", table]);
      return query;
    }
  } as unknown as SupabaseClient;
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

test("loads and normalizes project rows from the repository", async () => {
  const events: Array<[string, unknown?]> = [];
  const result = await loadAdminProjects(
    createRepositoryClient([projectRow({ business: "Car" })], events)
  );

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.data[0]?.business, "Automotive");
    assert.equal(result.data[0]?.adminKey, "project:project-id");
  }
  assert.deepEqual(events.slice(0, 3), [
    ["from", "projects"],
    ["select", "*"],
    ["order", "created_at"]
  ]);
});

test("finds a slug while excluding the currently edited project", async () => {
  const events: Array<[string, unknown?]> = [];
  const match = { id: "other-id", title: "Other", slug: "project" };
  const result = await findAdminProjectBySlug(
    createRepositoryClient(match, events),
    "project",
    "current-id"
  );

  assert.deepEqual(result, { ok: true, data: match });
  assert.ok(
    events.some(
      ([event, value]) => event === "neq:id" && value === "current-id"
    )
  );
});

test("returns normalized records from successful inserts", async () => {
  const events: Array<[string, unknown?]> = [];
  const payload = {
    ...projectRow(),
    id: undefined,
    business: "Automotive",
    short_description: "Saved",
    gallery_images: ["/gallery.jpg"],
    gallery_captions: ["Gallery"],
    gallery_items: [{ image: "/gallery.jpg", caption: "Gallery" }]
  };
  const result = await saveAdminProjectRecord(
    createRepositoryClient(projectRow(), events),
    payload
  );

  assert.equal(result.ok, true);
  if (result.ok)
    assert.equal(result.data.updatedAt, "2026-01-02T00:00:00.000Z");
  assert.ok(events.some(([event]) => event === "insert"));
});

test("deletes the matching project record", async () => {
  const events: Array<[string, unknown?]> = [];
  const result = await deleteAdminProjectRecord(
    createRepositoryClient({ id: "project-id" }, events),
    "project-id",
    "2026-01-02T00:00:00.000Z"
  );

  assert.deepEqual(result, { ok: true, data: null });
  assert.ok(events.some(([event]) => event === "delete"));
  assert.ok(
    events.some(
      ([event, value]) =>
        event === "eq:updated_at" && value === "2026-01-02T00:00:00.000Z"
    )
  );
});
