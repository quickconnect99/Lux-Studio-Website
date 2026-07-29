import assert from "node:assert/strict";
import test from "node:test";
import {
  parseSiteSettingsDraft,
  type SiteSettingsDraft
} from "../lib/admin-site-settings-draft";
import { toSiteSettingsFormState } from "../lib/admin-utils";
import { defaultSiteSettings } from "../lib/site-config";

test("restores a compatible versioned site settings draft", () => {
  const formState = toSiteSettingsFormState(defaultSiteSettings);
  formState.brandName = "Draft brand";
  const draft: SiteSettingsDraft = {
    version: 1,
    baseSnapshot: "saved-state",
    updatedAt: "2026-07-28T10:00:00.000Z",
    formState,
    hadPendingFiles: true
  };

  assert.deepEqual(
    parseSiteSettingsDraft(JSON.stringify(draft), "saved-state"),
    draft
  );
});

test("rejects drafts based on another saved settings version", () => {
  const formState = toSiteSettingsFormState(defaultSiteSettings);
  const draft: SiteSettingsDraft = {
    version: 1,
    baseSnapshot: "old-state",
    updatedAt: "2026-07-28T10:00:00.000Z",
    formState,
    hadPendingFiles: false
  };

  assert.equal(
    parseSiteSettingsDraft(JSON.stringify(draft), "new-state"),
    null
  );
});

test("rejects malformed site settings drafts", () => {
  assert.equal(parseSiteSettingsDraft("{", "saved-state"), null);
  assert.equal(
    parseSiteSettingsDraft(
      JSON.stringify({
        version: 1,
        baseSnapshot: "saved-state",
        updatedAt: "now",
        formState: {},
        hadPendingFiles: false
      }),
      "saved-state"
    ),
    null
  );
});
