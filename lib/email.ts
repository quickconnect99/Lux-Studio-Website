import "server-only";

import type { Inquiry } from "@/lib/types";

const DEFAULT_EMAIL_TIMEOUT_MS = 8_000;
const MINIMUM_EMAIL_TIMEOUT_MS = 1_000;
const MAXIMUM_EMAIL_TIMEOUT_MS = 30_000;

function getInquiryEmailConfiguration() {
  return {
    resendApiKey: process.env.RESEND_API_KEY,
    inquiryEmailTo: process.env.INQUIRY_EMAIL_TO,
    inquiryEmailFrom:
      process.env.INQUIRY_EMAIL_FROM ?? "Lux Studio <onboarding@resend.dev>"
  };
}

/** Reports whether all server-only values required for inquiry email are set. */
export function isInquiryEmailConfigured() {
  const { resendApiKey, inquiryEmailTo } = getInquiryEmailConfiguration();
  return Boolean(resendApiKey && inquiryEmailTo);
}

export function getInquiryEmailTimeoutMs(
  value = process.env.INQUIRY_EMAIL_TIMEOUT_MS
) {
  const parsed = Number(value ?? DEFAULT_EMAIL_TIMEOUT_MS);

  return Number.isInteger(parsed) &&
    parsed >= MINIMUM_EMAIL_TIMEOUT_MS &&
    parsed <= MAXIMUM_EMAIL_TIMEOUT_MS
    ? parsed
    : DEFAULT_EMAIL_TIMEOUT_MS;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatPlainTextInquiry(inquiry: Inquiry) {
  return [
    "New Lux Studio inquiry",
    "",
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    `Company: ${inquiry.company}`,
    `Service: ${inquiry.serviceType}`,
    "",
    "Brief:",
    inquiry.brief
  ].join("\n");
}

function formatHtmlInquiry(inquiry: Inquiry) {
  const fields = [
    ["Name", inquiry.name],
    ["Email", inquiry.email],
    ["Company", inquiry.company],
    ["Service", inquiry.serviceType]
  ];

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#171511">
      <h1 style="font-size:20px;margin:0 0 18px">New Lux Studio inquiry</h1>
      <table style="border-collapse:collapse;margin-bottom:18px">
        ${fields
          .map(
            ([label, value]) => `
              <tr>
                <td style="padding:6px 16px 6px 0;color:#6f675d">${escapeHtml(label)}</td>
                <td style="padding:6px 0;font-weight:600">${escapeHtml(value)}</td>
              </tr>
            `
          )
          .join("")}
      </table>
      <p style="margin:0 0 8px;color:#6f675d">Brief</p>
      <div style="white-space:pre-wrap;border:1px solid #ddd6ca;padding:14px;border-radius:10px">
        ${escapeHtml(inquiry.brief)}
      </div>
    </div>
  `;
}

/**
 * Sends one sanitized inquiry through Resend.
 *
 * Missing email configuration is a deliberate skip rather than an error,
 * allowing database persistence to work without the optional notification.
 * Non-success responses throw so the API route can record/report delivery
 * failure separately.
 */
export async function sendInquiryEmail(
  inquiry: Inquiry,
  {
    idempotencyKey,
    timeoutMs = getInquiryEmailTimeoutMs()
  }: { idempotencyKey?: string; timeoutMs?: number } = {}
) {
  const { resendApiKey, inquiryEmailTo, inquiryEmailFrom } =
    getInquiryEmailConfiguration();

  if (!resendApiKey || !inquiryEmailTo) {
    return { skipped: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {})
    },
    signal: AbortSignal.timeout(timeoutMs),
    body: JSON.stringify({
      from: inquiryEmailFrom,
      to: inquiryEmailTo,
      reply_to: inquiry.email,
      subject: `New inquiry from ${inquiry.name}`,
      text: formatPlainTextInquiry(inquiry),
      html: formatHtmlInquiry(inquiry)
    })
  });

  if (!response.ok) {
    throw new Error(`Resend email failed with status ${response.status}.`);
  }

  return { skipped: false };
}
