import assert from "node:assert/strict";
import test from "node:test";
import {
  serializeProjectFormState,
  serializeSiteSettingsFormState
} from "../lib/admin-form-snapshots";
import {
  createEmptyProject,
  toSiteSettingsFormState
} from "../lib/admin-utils";
import { defaultSiteSettings } from "../lib/site-config";

test("project snapshots reflect persisted values rather than editor-only noise", () => {
  const base = {
    ...createEmptyProject(),
    category: "Brand Film",
    carModel: "",
    updatedAt: "2026-07-28T10:00:00.000Z"
  };
  const equivalent = {
    ...base,
    carModel: "Brand Film",
    updatedAt: "2026-07-29T10:00:00.000Z"
  };

  assert.equal(
    serializeProjectFormState(base),
    serializeProjectFormState(equivalent)
  );
});

test("site settings snapshots normalize arrays and ignore updated_at", () => {
  const base = toSiteSettingsFormState(defaultSiteSettings);
  const equivalent = {
    ...base,
    updatedAt: "2030-01-01T00:00:00.000Z",
    socialLinks: base.socialLinks.map((link) => ({
      label: ` ${link.label} `,
      href: ` ${link.href} `
    }))
  };

  assert.equal(
    serializeSiteSettingsFormState(base),
    serializeSiteSettingsFormState(equivalent)
  );
});
