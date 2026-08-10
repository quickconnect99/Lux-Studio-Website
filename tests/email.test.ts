import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import type nodemailer from "nodemailer";
import {
  getInquiryEmailTimeoutMs,
  isInquiryEmailConfigured,
  sendInquiryEmail,
  sendTestInquiryEmail
} from "../lib/email";
import type { EmailSettingsRow } from "../lib/email-settings";
import type { Inquiry } from "../lib/types";

const originalEnvironment = {
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_SECURE: process.env.SMTP_SECURE,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  INQUIRY_EMAIL_TO: process.env.INQUIRY_EMAIL_TO,
  INQUIRY_EMAIL_FROM: process.env.INQUIRY_EMAIL_FROM
};
const inquiry: Inquiry = {
  name: "Ada <Admin>",
  email: "ada@example.com",
  company: "Cars & Co.",
  serviceType: "Commercial Shoot",
  brief: "Please film <script>alert('no')</script> without unsafe markup."
};

function restoreEnvironmentValue(
  key: keyof typeof originalEnvironment,
  value: string | undefined
) {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}

afterEach(() => {
  for (const [key, value] of Object.entries(originalEnvironment)) {
    restoreEnvironmentValue(key as keyof typeof originalEnvironment, value);
  }
});

function createFakeTransport(sendMail: (mail: unknown) => Promise<unknown>) {
  return (() => ({
    sendMail,
    close: () => {}
  })) as unknown as typeof nodemailer.createTransport;
}

const noStoredSettings = async () => null;

function storedRow(overrides: Partial<EmailSettingsRow> = {}): EmailSettingsRow {
  return {
    smtp_host: "db.example.com",
    smtp_port: 465,
    smtp_secure: true,
    smtp_user: "db-user@example.com",
    smtp_password: "db-password",
    inquiry_email_to: "db-to@example.com",
    inquiry_email_from: "DB Sender <db-from@example.com>",
    updated_at: "2026-08-10T00:00:00.000Z",
    ...overrides
  };
}

test("skips inquiry email when nothing is configured in the database or env", async () => {
  delete process.env.SMTP_HOST;
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASSWORD;
  delete process.env.INQUIRY_EMAIL_TO;

  assert.deepEqual(
    await sendInquiryEmail(inquiry, { fetchStoredSettings: noStoredSettings }),
    { skipped: true }
  );
  assert.equal(
    await isInquiryEmailConfigured(noStoredSettings),
    false
  );
});

test("sends escaped HTML and a plain-text copy through SMTP using env config", async () => {
  process.env.SMTP_HOST = "smtp.example.com";
  process.env.SMTP_PORT = "587";
  process.env.SMTP_USER = "studio@example.com";
  process.env.SMTP_PASSWORD = "app-password";
  process.env.INQUIRY_EMAIL_TO = "studio@example.com";
  process.env.INQUIRY_EMAIL_FROM = "Lux Test <sender@example.com>";

  let capturedMail: Record<string, unknown> | undefined;

  assert.equal(await isInquiryEmailConfigured(noStoredSettings), true);
  assert.deepEqual(
    await sendInquiryEmail(inquiry, {
      idempotencyKey: "inquiry-123",
      timeoutMs: 1_500,
      fetchStoredSettings: noStoredSettings,
      createTransport: createFakeTransport(async (mail) => {
        capturedMail = mail as Record<string, unknown>;
        return { messageId: "test" };
      })
    }),
    { skipped: false }
  );

  assert.equal(capturedMail?.from, "Lux Test <sender@example.com>");
  assert.equal(capturedMail?.to, "studio@example.com");
  assert.equal(capturedMail?.replyTo, inquiry.email);
  assert.equal(capturedMail?.messageId, "<inquiry-123@lux-studio-inquiries>");
  assert.match(String(capturedMail?.text), /Cars & Co\./);
  assert.doesNotMatch(String(capturedMail?.html), /<script>/);
  assert.match(String(capturedMail?.html), /&lt;script&gt;/);
  assert.match(String(capturedMail?.html), /Cars &amp; Co\./);
});

test("prefers admin-panel database settings over env vars", async () => {
  process.env.SMTP_HOST = "env.example.com";
  process.env.SMTP_USER = "env-user@example.com";
  process.env.SMTP_PASSWORD = "env-password";
  process.env.INQUIRY_EMAIL_TO = "env-to@example.com";

  let capturedMail: Record<string, unknown> | undefined;
  let capturedOptions: Record<string, unknown> | undefined;

  await sendInquiryEmail(inquiry, {
    fetchStoredSettings: async () => storedRow(),
    createTransport: ((options: Record<string, unknown>) => {
      capturedOptions = options;
      return {
        sendMail: async (mail: unknown) => {
          capturedMail = mail as Record<string, unknown>;
        },
        close: () => {}
      };
    }) as unknown as typeof nodemailer.createTransport
  });

  assert.equal(capturedOptions?.host, "db.example.com");
  assert.equal(capturedOptions?.port, 465);
  assert.equal(capturedOptions?.secure, true);
  assert.deepEqual(capturedOptions?.auth, {
    user: "db-user@example.com",
    pass: "db-password"
  });
  assert.equal(capturedMail?.to, "db-to@example.com");
  assert.equal(capturedMail?.from, "DB Sender <db-from@example.com>");
});

test("falls back to env vars for fields left blank in the database row", async () => {
  process.env.SMTP_PASSWORD = "env-password";

  let capturedOptions: Record<string, unknown> | undefined;

  await sendInquiryEmail(inquiry, {
    fetchStoredSettings: async () => storedRow({ smtp_password: null }),
    createTransport: ((options: Record<string, unknown>) => {
      capturedOptions = options;
      return { sendMail: async () => {}, close: () => {} };
    }) as unknown as typeof nodemailer.createTransport
  });

  assert.deepEqual(capturedOptions?.auth, {
    user: "db-user@example.com",
    pass: "env-password"
  });
});

test("surfaces SMTP send failures", async () => {
  process.env.SMTP_HOST = "smtp.example.com";
  process.env.SMTP_USER = "studio@example.com";
  process.env.SMTP_PASSWORD = "app-password";
  process.env.INQUIRY_EMAIL_TO = "studio@example.com";

  await assert.rejects(
    () =>
      sendInquiryEmail(inquiry, {
        fetchStoredSettings: noStoredSettings,
        createTransport: createFakeTransport(async () => {
          throw new Error("SMTP connection refused");
        })
      }),
    /SMTP connection refused/
  );
});

test("sends a one-off test email with an explicit config", async () => {
  let capturedMail: Record<string, unknown> | undefined;

  await sendTestInquiryEmail(
    {
      host: "smtp.example.com",
      port: 587,
      secure: false,
      user: "studio@example.com",
      password: "app-password",
      to: "studio@example.com",
      from: "Lux Studio <studio@example.com>"
    },
    {
      createTransport: createFakeTransport(async (mail) => {
        capturedMail = mail as Record<string, unknown>;
      })
    }
  );

  assert.equal(capturedMail?.subject, "Lux Studio SMTP test email");
  assert.equal(capturedMail?.to, "studio@example.com");
});

test("bounds configurable email timeouts", () => {
  assert.equal(getInquiryEmailTimeoutMs("1500"), 1_500);
  assert.equal(getInquiryEmailTimeoutMs("999"), 8_000);
  assert.equal(getInquiryEmailTimeoutMs("30001"), 8_000);
  assert.equal(getInquiryEmailTimeoutMs("not-a-number"), 8_000);
});
