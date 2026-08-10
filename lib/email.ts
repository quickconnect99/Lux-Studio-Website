import "server-only";

import nodemailer from "nodemailer";
import type { Inquiry } from "@/lib/types";

const DEFAULT_EMAIL_TIMEOUT_MS = 8_000;
const MINIMUM_EMAIL_TIMEOUT_MS = 1_000;
const MAXIMUM_EMAIL_TIMEOUT_MS = 30_000;
const DEFAULT_SMTP_PORT = 587;

function getInquiryEmailConfiguration() {
  const smtpUser = process.env.SMTP_USER;
  const smtpPort = Number(process.env.SMTP_PORT ?? DEFAULT_SMTP_PORT);

  return {
    smtpHost: process.env.SMTP_HOST,
    smtpPort: Number.isInteger(smtpPort) ? smtpPort : DEFAULT_SMTP_PORT,
    smtpSecure: process.env.SMTP_SECURE
      ? process.env.SMTP_SECURE === "true"
      : smtpPort === 465,
    smtpUser,
    smtpPassword: process.env.SMTP_PASSWORD,
    inquiryEmailTo: process.env.INQUIRY_EMAIL_TO,
    inquiryEmailFrom: process.env.INQUIRY_EMAIL_FROM ?? smtpUser
  };
}

/** Reports whether all server-only values required for inquiry email are set. */
export function isInquiryEmailConfigured() {
  const { smtpHost, smtpUser, smtpPassword, inquiryEmailTo } =
    getInquiryEmailConfiguration();
  return Boolean(smtpHost && smtpUser && smtpPassword && inquiryEmailTo);
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
 * Sends one sanitized inquiry through the configured SMTP mailbox.
 *
 * Missing email configuration is a deliberate skip rather than an error,
 * allowing database persistence to work without the optional notification.
 * Send failures throw so the API route can record/report delivery failure
 * separately.
 */
export async function sendInquiryEmail(
  inquiry: Inquiry,
  {
    idempotencyKey,
    timeoutMs = getInquiryEmailTimeoutMs(),
    createTransport = nodemailer.createTransport
  }: {
    idempotencyKey?: string;
    timeoutMs?: number;
    createTransport?: typeof nodemailer.createTransport;
  } = {}
) {
  const {
    smtpHost,
    smtpPort,
    smtpSecure,
    smtpUser,
    smtpPassword,
    inquiryEmailTo,
    inquiryEmailFrom
  } = getInquiryEmailConfiguration();

  if (!smtpHost || !smtpUser || !smtpPassword || !inquiryEmailTo) {
    return { skipped: true };
  }

  const transporter = createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: { user: smtpUser, pass: smtpPassword },
    connectionTimeout: timeoutMs,
    greetingTimeout: timeoutMs,
    socketTimeout: timeoutMs
  });

  try {
    await transporter.sendMail({
      from: inquiryEmailFrom,
      to: inquiryEmailTo,
      replyTo: inquiry.email,
      subject: `New inquiry from ${inquiry.name}`,
      text: formatPlainTextInquiry(inquiry),
      html: formatHtmlInquiry(inquiry),
      ...(idempotencyKey
        ? { messageId: `<${idempotencyKey}@lux-studio-inquiries>` }
        : {})
    });
  } finally {
    transporter.close();
  }

  return { skipped: false };
}
