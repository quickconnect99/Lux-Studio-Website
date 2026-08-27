import "./dom-setup";
import assert from "node:assert/strict";
import test from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { act, renderHook } from "@testing-library/react";
import { useAdminSiteSettings } from "../hooks/use-admin-site-settings";
import { defaultSiteSettings } from "../lib/site-config";
import { SITE_SETTINGS_DRAFT_STORAGE_KEY } from "../lib/admin-site-settings-draft";
import { toSiteSettingsFormState } from "../lib/admin-utils";
import { serializeSiteSettingsFormState } from "../lib/admin-form-snapshots";

function createSettingsClient(row: unknown) {
  const events: Array<[string, unknown?]> = [];
  const query = {
    select(columns: string) {
      events.push(["select", columns]);
      return query;
    },
    eq(column: string, value: unknown) {
      events.push([`eq:${column}`, value]);
      return query;
    },
    maybeSingle() {
      events.push(["maybeSingle"]);
      return Promise.resolve({ data: row, error: null });
    }
  };

  return {
    events,
    client: {
      from(table: string) {
        events.push(["from", table]);
        return query;
      }
    } as unknown as SupabaseClient
  };
}

function renderSettings(options: {
  supabase: SupabaseClient | null;
  sessionEmail?: string | null;
}) {
  const calls: string[] = [];
  const statusMessages: string[] = [];
  let saveReport: unknown = null;

  const setSaveReport = (report: unknown) => {
    saveReport = report;
    calls.push("setSaveReport");
  };
  const setUploadProgress = () => calls.push("setUploadProgress");
  const tryStartWorking = () => {
    calls.push("tryStartWorking");
    return true;
  };
  const finishWorking = () => calls.push("finishWorking");
  const showStatus = (message: string) => statusMessages.push(message);

  const view = renderHook(() =>
    useAdminSiteSettings({
      supabase: options.supabase,
      sessionEmail: options.sessionEmail ?? null,
      siteHeroVideoFile: null,
      selectedFrameFiles: [],
      aboutTeamGalleryFiles: [],
      aboutTeamMemberImageFiles: [],
      clearSiteSettingsMedia: () => calls.push("clearSiteSettingsMedia"),
      setSaveReport,
      setUploadProgress,
      tryStartWorking,
      finishWorking,
      showStatus
    })
  );

  return {
    ...view,
    calls,
    statusMessages,
    get saveReport() {
      return saveReport;
    }
  };
}

test.beforeEach(() => {
  localStorage.clear();
});

test("load without a configured Supabase client falls back to the static defaults", async () => {
  const { result } = renderSettings({ supabase: null });

  await act(async () => {
    await result.current.load();
  });

  assert.equal(
    result.current.formState.brandName,
    defaultSiteSettings.brand.name
  );
  assert.equal(result.current.isDirty, false);
});

test("load queries the singleton row by id and falls back to defaults when no row exists", async () => {
  const { client, events } = createSettingsClient(null);
  const { result } = renderSettings({ supabase: client });

  await act(async () => {
    await result.current.load();
  });

  assert.deepEqual(
    events.map(([event]) => event),
    ["from", "select", "eq:id", "maybeSingle"]
  );
  assert.equal(
    result.current.formState.brandName,
    defaultSiteSettings.brand.name
  );
});

test("load restores a matching offline draft and reports it to the user", async () => {
  const baseState = toSiteSettingsFormState(defaultSiteSettings);
  const baseSnapshot = serializeSiteSettingsFormState(baseState);
  localStorage.setItem(
    SITE_SETTINGS_DRAFT_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      baseSnapshot,
      updatedAt: "2026-01-01T00:00:00.000Z",
      hadPendingFiles: false,
      formState: { ...baseState, seoTitle: "Recovered SEO title" }
    })
  );

  const { result, statusMessages } = renderSettings({ supabase: null });

  await act(async () => {
    await result.current.load();
  });

  assert.equal(result.current.formState.seoTitle, "Recovered SEO title");
  assert.ok(
    statusMessages.some((message) => message.includes("draft restored"))
  );
});

test("updateField applies the change and clears the save report", async () => {
  const { result } = renderSettings({ supabase: null });
  await act(async () => {
    await result.current.load();
  });

  act(() => {
    result.current.updateField("seoTitle", "New title");
  });

  assert.equal(result.current.formState.seoTitle, "New title");
  assert.equal(result.current.isDirty, true);
});

test("reset restores the last loaded snapshot and clears local media", async () => {
  const { result, calls } = renderSettings({ supabase: null });
  await act(async () => {
    await result.current.load();
  });

  act(() => {
    result.current.updateField("seoTitle", "Unsaved change");
  });
  assert.equal(result.current.isDirty, true);

  act(() => {
    result.current.reset();
  });

  assert.equal(
    result.current.formState.seoTitle,
    defaultSiteSettings.seo.title
  );
  assert.equal(result.current.isDirty, false);
  assert.ok(calls.includes("clearSiteSettingsMedia"));
});

test("save without a configured Supabase client explains the offline fallback and does not throw", async () => {
  const { result, statusMessages, calls } = renderSettings({ supabase: null });
  await act(async () => {
    await result.current.load();
  });

  const saved = await act(async () => result.current.save());

  assert.equal(saved, false);
  assert.ok(calls.includes("tryStartWorking"));
  assert.ok(calls.includes("finishWorking"));
  assert.ok(
    statusMessages.some((message) => message.includes("Connect Supabase"))
  );
});

test("save without a signed-in session asks the admin to sign in first", async () => {
  const { client } = createSettingsClient(null);
  const { result, statusMessages } = renderSettings({
    supabase: client,
    sessionEmail: null
  });
  await act(async () => {
    await result.current.load();
  });

  const saved = await act(async () => result.current.save());

  assert.equal(saved, false);
  assert.ok(statusMessages.some((message) => message.includes("Sign in")));
});
