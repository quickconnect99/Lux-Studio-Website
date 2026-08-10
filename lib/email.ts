import "server-only";

import nodemailer from "nodemailer";
import { fetchStoredEmailSettings } from "@/lib/email-settings";
import type { EmailSettingsRow } from "@/lib/email-settings";
import type { Inquiry } from "@/lib/types";

const DEFAULT_EMAIL_TIMEOUT_MS = 8_000;
const MINIMUM_EMAIL_TIMEOUT_MS = 1_000;
const MAXIMUM_EMAIL_TIMEOUT_MS = 30_000;
const DEFAULT_SMTP_PORT = 587;

export type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  to: string;
  from: string;
};

type PartialSmtpConfig = Partial<SmtpConfig>;

/** Merges the admin-panel SMTP row with env vars, DB values taking priority. */
function mergeSmtpConfig(row: EmailSettingsRow | null): PartialSmtpConfig {
  const smtpUser = row?.smtp_user || process.env.SMTP_USER || undefined;
  const smtpPort = row?.smtp_port ?? Number(process.env.SMTP_PORT ?? NaN);

  return {
    host: row?.smtp_host || process.env.SMTP_HOST || undefined,
    port: Number.isInteger(smtpPort) ? smtpPort : DEFAULT_SMTP_PORT,
    secure:
      row?.smtp_secure ??
      (process.env.SMTP_SECURE
        ? process.env.SMTP_SECURE === "true"
        : smtpPort === 465),
    user: smtpUser,
    password: row?.smtp_password || process.env.SMTP_PASSWORD || undefined,
    to: row?.inquiry_email_to || process.env.INQUIRY_EMAIL_TO || undefined,
    from:
      row?.inquiry_email_from || process.env.INQUIRY_EMAIL_FROM || smtpUser
  };
}

function isCompleteConfig(config: PartialSmtpConfig): config is SmtpConfig {
  return Boolean(config.host && config.user && config.password && config.to);
}

async function resolveSmtpConfig(
  fetchStoredSettings: () => Promise<EmailSettingsRow | null>
): Promise<PartialSmtpConfig> {
  const row = await fetchStoredSettings();
  return mergeSmtpConfig(row);
}

/** Reports whether a complete SMTP configuration is available (DB or env). */
export async function isInquiryEmailConfigured(
  fetchStoredSettings: () => Promise<EmailSettingsRow | null> = fetchStoredEmailSettings
) {
  return isCompleteConfig(await resolveSmtpConfig(fetchStoredSettings));
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

type DeliverMailOptions = {
  timeoutMs?: number;
  createTransport?: typeof nodemailer.createTransport;
};

async function deliverMail(
  config: SmtpConfig,
  mail: { subject: string; replyTo?: string; text: string; html: string },
  {
    timeoutMs = getInquiryEmailTimeoutMs(),
    createTransport = nodemailer.createTransport
  }: DeliverMailOptions,
  messageId?: string
) {
  const transporter = createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.password },
    connectionTimeout: timeoutMs,
    greetingTimeout: timeoutMs,
    socketTimeout: timeoutMs
  });

  try {
    await transporter.sendMail({
      from: config.from,
      to: config.to,
      ...mail,
      ...(messageId ? { messageId } : {})
    });
  } finally {
    transporter.close();
  }
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
    timeoutMs,
    createTransport,
    fetchStoredSettings = fetchStoredEmailSettings
  }: DeliverMailOptions & {
    idempotencyKey?: string;
    fetchStoredSettings?: () => Promise<EmailSettingsRow | null>;
  } = {}
) {
  const config = await resolveSmtpConfig(fetchStoredSettings);

  if (!isCompleteConfig(config)) {
    return { skipped: true };
  }

  await deliverMail(
    config,
    {
      replyTo: inquiry.email,
      subject: `New inquiry from ${inquiry.name}`,
      text: formatPlainTextInquiry(inquiry),
      html: formatHtmlInquiry(inquiry)
    },
    { timeoutMs, createTransport },
    idempotencyKey ? `<${idempotencyKey}@lux-studio-inquiries>` : undefined
  );

  return { skipped: false };
}

/**
 * Sends a one-off test email using an explicit SMTP configuration.
 *
 * Used by the admin panel's "send test email" action so an admin can verify
 * unsaved credentials before persisting them. Always throws on failure;
 * there is no "skipped" state because the config is never optional here.
 */
export async function sendTestInquiryEmail(
  config: SmtpConfig,
  options: DeliverMailOptions = {}
) {
  const sampleInquiry: Inquiry = {
    name: "Lux Studio",
    email: config.to,
    company: "",
    serviceType: "Other",
    brief:
      "This is a test email from the Lux Studio admin panel to confirm your SMTP settings are working."
  };

  await deliverMail(
    config,
    {
      subject: "Lux Studio SMTP test email",
      text: formatPlainTextInquiry(sampleInquiry),
      html: formatHtmlInquiry(sampleInquiry)
    },
    options
  );
}
