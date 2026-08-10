import assert from "node:assert/strict";
import test from "node:test";
import {
  fetchStoredEmailSettings,
  markEmailSettingsVerified,
  saveEmailSettings,
  toPublicEmailSettings
} from "../lib/email-settings";
import type { EmailSettingsRow } from "../lib/email-settings";

const row: EmailSettingsRow = {
  smtp_host: "smtp.example.com",
  smtp_port: 587,
  smtp_secure: false,
  smtp_user: "studio@example.com",
  smtp_password: "secret",
  inquiry_email_to: "team@example.com",
  inquiry_email_from: "Lux Studio <studio@example.com>",
  verified_at: "2026-08-09T12:00:00.000Z",
  updated_at: "2026-08-10T12:00:00.000Z"
};

function createFetchClient(result: { data: unknown; error: unknown }) {
  const calls: { table?: string; column?: string; value?: unknown } = {};

  return {
    client: {
      from(table: string) {
        calls.table = table;
        return {
          select() {
            return {
              eq(column: string, value: unknown) {
                calls.column = column;
                calls.value = value;
                return { maybeSingle: async () => result };
              }
            };
          }
        };
      }
    },
    calls
  };
}

function createSaveClient(result: { data: unknown; error: unknown }) {
  let capturedPayload: Record<string, unknown> | undefined;
  let capturedOptions: Record<string, unknown> | undefined;

  return {
    client: {
      from() {
        return {
          upsert(payload: Record<string, unknown>, options: Record<string, unknown>) {
            capturedPayload = payload;
            capturedOptions = options;
            return {
              select() {
                return { single: async () => result };
              }
            };
          }
        };
      }
    },
    getCapturedPayload: () => capturedPayload,
    getCapturedOptions: () => capturedOptions
  };
}

function createUpdateClient(result: { data: unknown; error: unknown }) {
  let capturedPayload: Record<string, unknown> | undefined;
  let capturedFilter: { column?: string; value?: unknown } = {};

  return {
    client: {
      from() {
        return {
          update(payload: Record<string, unknown>) {
            capturedPayload = payload;
            return {
              eq(column: string, value: unknown) {
                capturedFilter = { column, value };
                return {
                  select() {
                    return { single: async () => result };
                  }
                };
              }
            };
          }
        };
      }
    },
    getCapturedPayload: () => capturedPayload,
    getCapturedFilter: () => capturedFilter
  };
}

test("toPublicEmailSettings returns safe defaults for an unconfigured row", () => {
  assert.deepEqual(toPublicEmailSettings(null), {
    smtpHost: "",
    smtpPort: 587,
    smtpSecure: false,
    smtpUser: "",
    hasSmtpPassword: false,
    inquiryEmailTo: "",
    inquiryEmailFrom: "",
    isVerified: false,
    verifiedAt: null,
    updatedAt: null
  });
});

test("toPublicEmailSettings never leaks the raw password", () => {
  const settings = toPublicEmailSettings(row);

  assert.equal(settings.hasSmtpPassword, true);
  assert.equal(settings.smtpHost, "smtp.example.com");
  assert.equal(settings.isVerified, true);
  assert.equal(settings.verifiedAt, "2026-08-09T12:00:00.000Z");
  assert.equal(settings.updatedAt, "2026-08-10T12:00:00.000Z");
  assert.ok(!("smtpPassword" in settings));
});

test("toPublicEmailSettings reports not verified once verified_at is cleared", () => {
  const settings = toPublicEmailSettings({ ...row, verified_at: null });
  assert.equal(settings.isVerified, false);
});

test("toPublicEmailSettings reports no password when none is stored", () => {
  const settings = toPublicEmailSettings({ ...row, smtp_password: null });
  assert.equal(settings.hasSmtpPassword, false);
});

test("fetchStoredEmailSettings returns null without a configured admin client", async () => {
  assert.equal(await fetchStoredEmailSettings(null), null);
});

test("fetchStoredEmailSettings queries the singleton global row", async () => {
  const { client, calls } = createFetchClient({ data: row, error: null });

  const result = await fetchStoredEmailSettings(client as never);

  assert.deepEqual(result, row);
  assert.equal(calls.table, "email_settings");
  assert.equal(calls.column, "id");
  assert.equal(calls.value, "global");
});

test("fetchStoredEmailSettings returns null on a database error", async () => {
  const { client } = createFetchClient({
    data: null,
    error: new Error("boom")
  });

  assert.equal(await fetchStoredEmailSettings(client as never), null);
});

test("saveEmailSettings omits the password from the upsert when left blank", async () => {
  const { client, getCapturedPayload, getCapturedOptions } = createSaveClient({
    data: row,
    error: null
  });

  await saveEmailSettings(client as never, {
    smtpHost: "smtp.example.com",
    smtpPort: 587,
    smtpSecure: false,
    smtpUser: "studio@example.com",
    inquiryEmailTo: "team@example.com",
    inquiryEmailFrom: "Lux Studio <studio@example.com>"
  });

  const payload = getCapturedPayload();
  assert.equal(payload?.id, "global");
  assert.ok(!("smtp_password" in (payload ?? {})));
  assert.deepEqual(getCapturedOptions(), { onConflict: "id" });
});

test("saveEmailSettings includes the password when a new one is provided", async () => {
  const { client, getCapturedPayload } = createSaveClient({
    data: row,
    error: null
  });

  await saveEmailSettings(client as never, {
    smtpHost: "smtp.example.com",
    smtpPort: 587,
    smtpSecure: false,
    smtpUser: "studio@example.com",
    smtpPassword: "new-secret",
    inquiryEmailTo: "team@example.com",
    inquiryEmailFrom: "Lux Studio <studio@example.com>"
  });

  assert.equal(getCapturedPayload()?.smtp_password, "new-secret");
});

test("saveEmailSettings always clears verified_at, even when nothing else changed", async () => {
  const { client, getCapturedPayload } = createSaveClient({
    data: row,
    error: null
  });

  await saveEmailSettings(client as never, {
    smtpHost: "smtp.example.com",
    smtpPort: 587,
    smtpSecure: false,
    smtpUser: "studio@example.com",
    inquiryEmailTo: "team@example.com",
    inquiryEmailFrom: "Lux Studio <studio@example.com>"
  });

  assert.equal(getCapturedPayload()?.verified_at, null);
});

test("markEmailSettingsVerified sets verified_at on the global row", async () => {
  const { client, getCapturedPayload, getCapturedFilter } = createUpdateClient(
    { data: row, error: null }
  );

  await markEmailSettingsVerified(client as never);

  assert.equal(typeof getCapturedPayload()?.verified_at, "string");
  assert.deepEqual(getCapturedFilter(), { column: "id", value: "global" });
});
