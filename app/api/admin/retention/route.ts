import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getInquiryRetentionDays } from "@/lib/inquiry-retention";
import { getRequestId, logServerEvent } from "@/lib/server-observability";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function secretsMatch(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export async function GET(request: Request) {
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
      event: "inquiry.retention_unauthorized",
      requestId
    });
    return json({ message: "Unauthorized." }, 401);
  }

  const supabase = createAdminSupabaseClient();
  if (!supabase) {
    logServerEvent({
      level: "error",
      event: "inquiry.retention_unavailable",
      requestId
    });
    return json({ message: "Retention service is unavailable." }, 503);
  }

  const retentionDays = getInquiryRetentionDays();
  const { data, error } = await supabase.rpc("delete_expired_inquiries", {
    p_retention_days: retentionDays
  });

  const deletedCount =
    typeof data === "number"
      ? data
      : typeof data === "string" && /^\d+$/.test(data)
        ? Number(data)
        : Number.NaN;

  if (error || !Number.isSafeInteger(deletedCount) || deletedCount < 0) {
    logServerEvent({
      level: "error",
      event: "inquiry.retention_failed",
      requestId,
      error,
      context: { retentionDays }
    });
    return json({ message: "Retention cleanup failed." }, 500);
  }

  logServerEvent({
    level: "info",
    event: "inquiry.retention_completed",
    requestId,
    context: {
      retentionDays,
      deletedCount
    }
  });

  return json({ deletedCount, retentionDays }, 200);
}
