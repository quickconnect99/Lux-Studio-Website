import assert from "node:assert/strict";
import test from "node:test";
import {
  createEmailSettingsGetHandler,
  createEmailSettingsPostHandler
} from "../app/api/admin/email-settings/route";
import type { EmailSettingsRow } from "../lib/email-settings";

const storedRow: EmailSettingsRow = {
  smtp_host: "smtp.example.com",
  smtp_port: 587,
  smtp_secure: false,
  smtp_user: "studio@example.com",
  smtp_password: "stored-secret",
  inquiry_email_to: "team@example.com",
  inquiry_email_from: "Lux Studio <studio@example.com>",
  updated_at: "2026-08-10T12:00:00.000Z"
};

function createRequest(
  method: string,
  {
    headers = {},
    body
  }: { headers?: Record<string, string>; body?: unknown } = {}
) {
  return new Request("https://www.luxstudio.li/api/admin/email-settings", {
    method,
    headers: {
      origin: "https://www.luxstudio.li",
      "x-request-id": "admin-email-settings-test-request",
      ...(body !== undefined ? { "content-type": "application/json" } : {}),
      ...headers
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {})
  });
}

function createDependencies(overrides: Record<string, unknown> = {}) {
  return {
    checkAdmin: async () => ({ data: true, error: null }),
    getSettings: async () => storedRow,
    saveSettings: async () => ({ data: storedRow, error: null }),
    sendTest: async () => {},
    ...overrides
  };
}

const authHeaders = { authorization: "Bearer admin-token" };

test("rejects requests from a different origin", async () => {
  const handler = createEmailSettingsGetHandler(createDependencies());
  const response = await handler(
    createRequest("GET", { headers: { origin: "https://attacker.example" } })
  );

  assert.equal(response.status, 403);
});

test("requires an admin bearer session", async () => {
  const handler = createEmailSettingsGetHandler(createDependencies());
  const response = await handler(createRequest("GET"));

  assert.equal(response.status, 401);
});

test("rejects a non-admin session", async () => {
  const handler = createEmailSettingsGetHandler(
    createDependencies({
      checkAdmin: async () => ({ data: false, error: null })
    })
  );
  const response = await handler(createRequest("GET", { headers: authHeaders }));

  assert.equal(response.status, 403);
});

test("returns redacted settings without the stored password", async () => {
  const handler = createEmailSettingsGetHandler(createDependencies());
  const response = await handler(createRequest("GET", { headers: authHeaders }));

  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.settings.hasSmtpPassword, true);
  assert.equal(body.settings.smtpHost, "smtp.example.com");
  assert.ok(!("smtpPassword" in body.settings));
});

test("rejects saving with missing required fields", async () => {
  const handler = createEmailSettingsPostHandler(createDependencies());
  const response = await handler(
    createRequest("POST", {
      headers: authHeaders,
      body: { smtpHost: "", smtpUser: "", smtpPort: 0, inquiryEmailTo: "" }
    })
  );

  assert.equal(response.status, 400);
  const body = await response.json();
  assert.ok(body.errors.smtpHost);
  assert.ok(body.errors.smtpUser);
  assert.ok(body.errors.smtpPort);
  assert.ok(body.errors.inquiryEmailTo);
});

test("saves valid settings and omits an empty password from the update", async () => {
  let savedInput: Record<string, unknown> | undefined;
  const handler = createEmailSettingsPostHandler(
    createDependencies({
      saveSettings: async (input: Record<string, unknown>) => {
        savedInput = input;
        return { data: storedRow, error: null };
      }
    })
  );

  const response = await handler(
    createRequest("POST", {
      headers: authHeaders,
      body: {
        smtpHost: "smtp.example.com",
        smtpPort: 587,
        smtpSecure: false,
        smtpUser: "studio@example.com",
        smtpPassword: "",
        inquiryEmailTo: "team@example.com",
        inquiryEmailFrom: ""
      }
    })
  );

  assert.equal(response.status, 200);
  assert.equal(savedInput?.smtpPassword, undefined);
  assert.equal(savedInput?.inquiryEmailFrom, "studio@example.com");
});

test("test action requires a password when none is stored", async () => {
  const handler = createEmailSettingsPostHandler(
    createDependencies({ getSettings: async () => null })
  );

  const response = await handler(
    createRequest("POST", {
      headers: authHeaders,
      body: {
        action: "test",
        smtpHost: "smtp.example.com",
        smtpPort: 587,
        smtpSecure: false,
        smtpUser: "studio@example.com",
        smtpPassword: "",
        inquiryEmailTo: "team@example.com"
      }
    })
  );

  assert.equal(response.status, 400);
  const body = await response.json();
  assert.match(body.message, /password/i);
});

test("test action falls back to the stored password when the form field is blank", async () => {
  let sentConfig: Record<string, unknown> | undefined;
  const handler = createEmailSettingsPostHandler(
    createDependencies({
      sendTest: async (config: Record<string, unknown>) => {
        sentConfig = config;
      }
    })
  );

  const response = await handler(
    createRequest("POST", {
      headers: authHeaders,
      body: {
        action: "test",
        smtpHost: "smtp.example.com",
        smtpPort: 587,
        smtpSecure: false,
        smtpUser: "studio@example.com",
        smtpPassword: "",
        inquiryEmailTo: "team@example.com"
      }
    })
  );

  assert.equal(response.status, 200);
  assert.equal(sentConfig?.password, "stored-secret");
});

test("test action reports a friendly error when sending fails", async () => {
  const handler = createEmailSettingsPostHandler(
    createDependencies({
      sendTest: async () => {
        throw new Error("connection refused");
      }
    })
  );

  const response = await handler(
    createRequest("POST", {
      headers: authHeaders,
      body: {
        action: "test",
        smtpHost: "smtp.example.com",
        smtpPort: 587,
        smtpSecure: false,
        smtpUser: "studio@example.com",
        smtpPassword: "fresh-secret",
        inquiryEmailTo: "team@example.com"
      }
    })
  );

  assert.equal(response.status, 502);
});
