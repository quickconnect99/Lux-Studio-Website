import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import type nodemailer from "nodemailer";
import { getInquiryEmailTimeoutMs, sendInquiryEmail } from "../lib/email";
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

test("skips inquiry email when the optional provider is not configured", async () => {
  delete process.env.SMTP_HOST;
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASSWORD;
  delete process.env.INQUIRY_EMAIL_TO;

  assert.deepEqual(await sendInquiryEmail(inquiry), { skipped: true });
});

test("sends escaped HTML and a plain-text copy through SMTP", async () => {
  process.env.SMTP_HOST = "smtp.example.com";
  process.env.SMTP_PORT = "587";
  process.env.SMTP_USER = "studio@example.com";
  process.env.SMTP_PASSWORD = "app-password";
  process.env.INQUIRY_EMAIL_TO = "studio@example.com";
  process.env.INQUIRY_EMAIL_FROM = "Lux Test <sender@example.com>";

  let capturedMail: Record<string, unknown> | undefined;

  assert.deepEqual(
    await sendInquiryEmail(inquiry, {
      idempotencyKey: "inquiry-123",
      timeoutMs: 1_500,
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

test("surfaces SMTP send failures", async () => {
  process.env.SMTP_HOST = "smtp.example.com";
  process.env.SMTP_USER = "studio@example.com";
  process.env.SMTP_PASSWORD = "app-password";
  process.env.INQUIRY_EMAIL_TO = "studio@example.com";

  await assert.rejects(
    () =>
      sendInquiryEmail(inquiry, {
        createTransport: createFakeTransport(async () => {
          throw new Error("SMTP connection refused");
        })
      }),
    /SMTP connection refused/
  );
});

test("bounds configurable email timeouts", () => {
  assert.equal(getInquiryEmailTimeoutMs("1500"), 1_500);
  assert.equal(getInquiryEmailTimeoutMs("999"), 8_000);
  assert.equal(getInquiryEmailTimeoutMs("30001"), 8_000);
  assert.equal(getInquiryEmailTimeoutMs("not-a-number"), 8_000);
});
