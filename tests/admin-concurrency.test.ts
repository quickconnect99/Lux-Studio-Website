import assert from "node:assert/strict";
import test from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildProjectDatabasePayload,
  buildSiteSettingsDatabasePayload,
  getProjectMediaState
} from "../lib/admin-persistence";
import {
  deleteAdminProjectRecord,
  saveAdminProjectRecord
} from "../lib/admin-project-repository";
import { saveAdminSiteSettingsRecord } from "../lib/admin-site-settings-repository";
import {
  createEmptyProject,
  toSiteSettingsFormState
} from "../lib/admin-utils";
import { defaultSiteSettings } from "../lib/site-config";

function createStaleUpdateClient(filters: Array<[string, unknown]>) {
  const query = {
    update() {
      return query;
    },
    delete() {
      return query;
    },
    insert() {
      return query;
    },
    eq(column: string, value: unknown) {
      filters.push([column, value]);
      return query;
    },
    select() {
      return query;
    },
    async maybeSingle() {
      return { data: null, error: null };
    },
    async single() {
      return { data: null, error: null };
    }
  };

  return {
    from() {
      return query;
    }
  } as unknown as SupabaseClient;
}

test("project saves reject a stale updated_at snapshot", async () => {
  const filters: Array<[string, unknown]> = [];
  const supabase = createStaleUpdateClient(filters);
  const formState = {
    ...createEmptyProject(),
    id: "project-id",
    updatedAt: "2026-07-28T10:00:00.000Z"
  };
  const payload = buildProjectDatabasePayload({
    formState,
    slug: formState.slug,
    media: getProjectMediaState(formState)
  });
  const result = await saveAdminProjectRecord(supabase, payload, {
    expectedUpdatedAt: formState.updatedAt
  });

  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.error.kind, "conflict");
  assert.deepEqual(filters, [
    ["id", "project-id"],
    ["updated_at", "2026-07-28T10:00:00.000Z"]
  ]);
});

test("site settings saves reject a stale updated_at snapshot", async () => {
  const filters: Array<[string, unknown]> = [];
  const supabase = createStaleUpdateClient(filters);
  const formState = toSiteSettingsFormState(defaultSiteSettings);
  const result = await saveAdminSiteSettingsRecord(
    supabase,
    buildSiteSettingsDatabasePayload(formState),
    {
      recordExists: true,
      expectedUpdatedAt: formState.updatedAt
    }
  );

  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.error.kind, "conflict");
  assert.deepEqual(filters, [
    ["id", "global"],
    ["updated_at", formState.updatedAt]
  ]);
});

test("project deletes reject a stale updated_at snapshot", async () => {
  const filters: Array<[string, unknown]> = [];
  const supabase = createStaleUpdateClient(filters);
  const result = await deleteAdminProjectRecord(
    supabase,
    "project-id",
    "2026-07-28T10:00:00.000Z"
  );

  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.error.kind, "conflict");
  assert.deepEqual(filters, [
    ["id", "project-id"],
    ["updated_at", "2026-07-28T10:00:00.000Z"]
  ]);
});
