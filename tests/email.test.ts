import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { sendInquiryEmail } from "../lib/email";
import type { Inquiry } from "../lib/types";

const originalFetch = globalThis.fetch;
const originalEnvironment = {
  RESEND_API_KEY: process.env.RESEND_API_KEY,
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
  globalThis.fetch = originalFetch;
  for (const [key, value] of Object.entries(originalEnvironment)) {
    restoreEnvironmentValue(key as keyof typeof originalEnvironment, value);
  }
});

test("skips inquiry email when the optional provider is not configured", async () => {
  delete process.env.RESEND_API_KEY;
  delete process.env.INQUIRY_EMAIL_TO;

  assert.deepEqual(await sendInquiryEmail(inquiry), { skipped: true });
});

test("sends escaped HTML and a plain-text copy through Resend", async () => {
  process.env.RESEND_API_KEY = "test-api-key";
  process.env.INQUIRY_EMAIL_TO = "studio@example.com";
  process.env.INQUIRY_EMAIL_FROM = "Lux Test <sender@example.com>";
  let capturedInit: RequestInit | undefined;

  globalThis.fetch = async (_input, init) => {
    capturedInit = init;
    return new Response("{}", { status: 200 });
  };

  assert.deepEqual(await sendInquiryEmail(inquiry), { skipped: false });
  assert.equal(
    (capturedInit?.headers as Record<string, string>).Authorization,
    "Bearer test-api-key"
  );

  const body = JSON.parse(String(capturedInit?.body)) as {
    from: string;
    to: string;
    reply_to: string;
    text: string;
    html: string;
  };
  assert.equal(body.from, "Lux Test <sender@example.com>");
  assert.equal(body.to, "studio@example.com");
  assert.equal(body.reply_to, inquiry.email);
  assert.match(body.text, /Cars & Co\./);
  assert.doesNotMatch(body.html, /<script>/);
  assert.match(body.html, /&lt;script&gt;/);
  assert.match(body.html, /Cars &amp; Co\./);
});

test("surfaces non-successful Resend responses", async () => {
  process.env.RESEND_API_KEY = "test-api-key";
  process.env.INQUIRY_EMAIL_TO = "studio@example.com";
  globalThis.fetch = async () =>
    new Response("provider unavailable", { status: 503 });

  await assert.rejects(
    () => sendInquiryEmail(inquiry),
    /Resend email failed: 503 provider unavailable/
  );
});
