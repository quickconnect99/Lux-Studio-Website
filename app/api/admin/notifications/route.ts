import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { sendInquiryEmail } from "@/lib/email";
import { parseInquiryServiceType, sanitizeInquiry } from "@/lib/inquiry";
import { getRequestId, logServerEvent } from "@/lib/server-observability";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import type { Inquiry } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NOTIFICATION_BATCH_SIZE = 20;
const NOTIFICATION_MAX_ATTEMPTS = 5;

type NotificationStatus = "failed" | "sent" | "skipped";

export type NotificationRow = {
  inquiry_id: string;
  name: string;
  email: string;
  company: string | null;
  service_type: string | null;
  brief: string;
  notification_attempts: number;
};

type NotificationDependencies = {
  claim: () => Promise<{ data: unknown; error: unknown }>;
  mark: (
    inquiryId: string,
    status: NotificationStatus,
    sentAt: string | null
  ) => Promise<unknown>;
  send: (
    inquiry: Inquiry,
    options: { idempotencyKey: string }
  ) => Promise<{ skipped: boolean }>;
};

function secretsMatch(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function createDefaultDependencies(): NotificationDependencies | null {
  const supabase = createAdminSupabaseClient();
  if (!supabase) {
    return null;
  }

  return {
    async claim() {
      const { data, error } = await supabase.rpc(
        "claim_inquiry_notifications",
        {
          p_batch_size: NOTIFICATION_BATCH_SIZE,
          p_max_attempts: NOTIFICATION_MAX_ATTEMPTS
        }
      );

      return { data, error };
    },
    async mark(inquiryId, status, sentAt) {
      const { error } = await supabase
        .from("inquiries")
        .update({
          notification_status: status,
          notification_sent_at: sentAt
        })
        .eq("id", inquiryId);

      return error;
    },
    send: (inquiry, options) => sendInquiryEmail(inquiry, options)
  };
}

function isNotificationRow(value: unknown): value is NotificationRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Record<string, unknown>;
  return (
    typeof row.inquiry_id === "string" &&
    typeof row.name === "string" &&
    typeof row.email === "string" &&
    (typeof row.company === "string" || row.company === null) &&
    (typeof row.service_type === "string" || row.service_type === null) &&
    typeof row.brief === "string" &&
    typeof row.notification_attempts === "number"
  );
}

export function createNotificationRetryHandler(
  dependencies?: NotificationDependencies
) {
  return async function GET(request: Request) {
    const requestId = getRequestId(request.headers);
    const configuredSecret = process.env.CRON_SECRET?.trim();
    const suppliedSecret = request.headers
      .get("authorization")
      ?.replace(/^Bearer\s+/i, "")
      .trim();

    function json(body: Record<string, unknown>, status: number) {
      return NextResponse.json(body, {
        status,
        headers: {
          "cache-control": "no-store",
          "x-request-id": requestId
        }
      });
    }

    if (
      !configuredSecret ||
      !suppliedSecret ||
      !secretsMatch(configuredSecret, suppliedSecret)
    ) {
      logServerEvent({
        level: "warn",
        event: "inquiry.notification_retry_unauthorized",
        requestId
      });
      return json({ message: "Unauthorized." }, 401);
    }

    const resolvedDependencies = dependencies ?? createDefaultDependencies();
    if (!resolvedDependencies) {
      return json({ message: "Notification retry is unavailable." }, 503);
    }

    const { data, error } = await resolvedDependencies.claim();
    if (error || !Array.isArray(data) || !data.every(isNotificationRow)) {
      logServerEvent({
        level: "error",
        event: "inquiry.notification_claim_failed",
        requestId,
        error
      });
      return json({ message: "Notification retry failed." }, 500);
    }

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const row of data) {
      const inquiry = sanitizeInquiry({
        name: row.name,
        email: row.email,
        company: row.company ?? "",
        serviceType: parseInquiryServiceType(row.service_type),
        brief: row.brief
      });

      try {
        const result = await resolvedDependencies.send(inquiry, {
          idempotencyKey: row.inquiry_id
        });
        const status = result.skipped ? "skipped" : "sent";
        const markError = await resolvedDependencies.mark(
          row.inquiry_id,
          status,
          result.skipped ? null : new Date().toISOString()
        );

        if (markError) {
          logServerEvent({
            level: "error",
            event: "inquiry.notification_status_update_failed",
            requestId,
            error: markError,
            context: { notificationAttempts: row.notification_attempts }
          });
        }

        if (result.skipped) {
          skipped += 1;
        } else {
          sent += 1;
        }
      } catch (sendError) {
        failed += 1;
        const markError = await resolvedDependencies.mark(
          row.inquiry_id,
          "failed",
          null
        );
        logServerEvent({
          level: "error",
          event: "inquiry.notification_retry_failed",
          requestId,
          error: sendError,
          context: {
            notificationAttempts: row.notification_attempts,
            statusUpdateFailed: Boolean(markError)
          }
        });
      }
    }

    logServerEvent({
      level: "info",
      event: "inquiry.notification_retry_completed",
      requestId,
      context: {
        claimed: data.length,
        sent,
        skipped,
        failed
      }
    });

    return json({ claimed: data.length, sent, skipped, failed }, 200);
  };
}

export const GET = createNotificationRetryHandler();
