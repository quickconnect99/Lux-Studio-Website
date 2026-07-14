import "server-only";

import type { Inquiry } from "@/lib/types";

const resendApiKey = process.env.RESEND_API_KEY;
const inquiryEmailTo = process.env.INQUIRY_EMAIL_TO;
const inquiryEmailFrom =
  process.env.INQUIRY_EMAIL_FROM ?? "Lux Studio <onboarding@resend.dev>";

export function isInquiryEmailConfigured() {
  return Boolean(resendApiKey && inquiryEmailTo);
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

export async function sendInquiryEmail(inquiry: Inquiry) {
  if (!isInquiryEmailConfigured()) {
    return { skipped: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json"
    },
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
    const message = await response.text();
    throw new Error(`Resend email failed: ${response.status} ${message}`);
  }

  return { skipped: false };
}
