import { NextResponse } from "next/server";
import {
  INQUIRY_RATE_LIMIT_MAX_REQUESTS,
  INQUIRY_RATE_LIMIT_WINDOW_MS,
  getInquiryProtectionIssue,
  parseInquiryServiceType,
  sanitizeInquiry,
  validateInquiry
} from "@/lib/inquiry";
import { sendInquiryEmail } from "@/lib/email";
import { consumeInquiryRateLimit } from "@/lib/inquiry-rate-limit";
import { pruneRateLimitStore } from "@/lib/rate-limit";
import {
  getRequestId,
  logServerEvent
} from "@/lib/server-observability";
import { createAdminSupabaseClient, isServiceRoleConfigured } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const rateLimitStore =
  (
    globalThis as typeof globalThis & {
      __inquiryRateLimit?: Map<string, number[]>;
    }
  ).__inquiryRateLimit ??
  new Map<string, number[]>();

(
  globalThis as typeof globalThis & {
    __inquiryRateLimit?: Map<string, number[]>;
  }
).__inquiryRateLimit = rateLimitStore;

function getClientKey(headers: Headers) {
  const forwardedFor = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = headers.get("x-real-ip")?.trim();
  const userAgent = headers.get("user-agent")?.trim() ?? "unknown";

  return `${forwardedFor || realIp || "unknown"}:${userAgent.slice(0, 120)}`;
}

let pruneCallCount = 0;
let lastRateLimitFallbackLogAt = 0;

function prepareLocalRateLimitStore() {
  pruneCallCount += 1;
  if (pruneCallCount % 50 === 0) {
    pruneRateLimitStore(rateLimitStore, INQUIRY_RATE_LIMIT_WINDOW_MS);
  }
}

function isAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return true;
  }

  try {
    const originHost = new URL(origin).host;
    const requestHost = request.headers.get("host");

    if (requestHost && originHost === requestHost) {
      return true;
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    return siteUrl ? new URL(siteUrl).host === originHost : false;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const requestId = getRequestId(request.headers);

  function json(
    body: Record<string, unknown>,
    init?: { status?: number }
  ) {
    return NextResponse.json(body, {
      ...init,
      headers: {
        "x-request-id": requestId
      }
    });
  }

  if (!isAllowedOrigin(request)) {
    logServerEvent({
      level: "warn",
      event: "inquiry.origin_rejected",
      requestId
    });
    return json(
      { message: "The inquiry could not be submitted from this origin." },
      { status: 403 }
    );
  }

  if (!isServiceRoleConfigured()) {
    logServerEvent({
      level: "error",
      event: "inquiry.service_role_missing",
      requestId
    });
    return json(
      {
        message:
          "Inquiry endpoint is not configured. Add SUPABASE_SERVICE_ROLE_KEY on the server."
      },
      { status: 503 }
    );
  }

  const supabase = createAdminSupabaseClient();

  if (!supabase) {
    logServerEvent({
      level: "error",
      event: "inquiry.admin_client_unavailable",
      requestId
    });
    return json(
      { message: "Supabase admin client could not be created." },
      { status: 503 }
    );
  }

  const clientKey = getClientKey(request.headers);
  prepareLocalRateLimitStore();
  const rateLimit = await consumeInquiryRateLimit({
    key: clientKey,
    maxAttempts: INQUIRY_RATE_LIMIT_MAX_REQUESTS,
    windowMs: INQUIRY_RATE_LIMIT_WINDOW_MS,
    localStore: rateLimitStore,
    persistentConsume: (parameters) =>
      supabase.rpc("consume_inquiry_rate_limit", parameters)
  });

  if (
    rateLimit.fallbackReason &&
    Date.now() - lastRateLimitFallbackLogAt > 5 * 60_000
  ) {
    lastRateLimitFallbackLogAt = Date.now();
    logServerEvent({
      level: "warn",
      event: "inquiry.rate_limit_fallback",
      requestId,
      context: {
        fallbackReason: rateLimit.fallbackReason
      }
    });
  }

  if (!rateLimit.allowed) {
    return json(
      { message: "Too many inquiries from this browser. Please try again later." },
      { status: 429 }
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return json(
      { message: "The inquiry payload could not be parsed." },
      { status: 400 }
    );
  }

  const body =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};

  const inquiry = sanitizeInquiry({
    name: typeof body.name === "string" ? body.name : "",
    email: typeof body.email === "string" ? body.email : "",
    company: typeof body.company === "string" ? body.company : "",
    serviceType: parseInquiryServiceType(body.serviceType),
    brief: typeof body.brief === "string" ? body.brief : ""
  });

  const errors = validateInquiry(inquiry);

  if (Object.keys(errors).length > 0) {
    return json(
      {
        message: "Please review the highlighted fields before sending the inquiry.",
        errors
      },
      { status: 400 }
    );
  }

  const protectionIssue = getInquiryProtectionIssue({
    website: typeof body.website === "string" ? body.website : "",
    startedAt:
      typeof body.startedAt === "number" && Number.isFinite(body.startedAt)
        ? body.startedAt
        : undefined
  });

  if (protectionIssue) {
    return json({ message: protectionIssue }, { status: 400 });
  }

  const { error } = await supabase.from("inquiries").insert({
    name: inquiry.name,
    email: inquiry.email,
    company: inquiry.company,
    service_type: inquiry.serviceType,
    brief: inquiry.brief
  });

  if (error) {
    logServerEvent({
      level: "error",
      event: "inquiry.database_insert_failed",
      requestId,
      error
    });
    return json(
      { message: "The inquiry could not be saved." },
      { status: 500 }
    );
  }

  try {
    const email = await sendInquiryEmail(inquiry);
    if (email.skipped) {
      logServerEvent({
        level: "warn",
        event: "inquiry.email_skipped",
        requestId,
        context: {
          reason: "email-provider-not-configured"
        }
      });
    }
  } catch (emailError) {
    logServerEvent({
      level: "error",
      event: "inquiry.email_failed",
      requestId,
      error: emailError
    });
  }

  return json({
    message: "Inquiry received - we'll be in touch within 24-48 hours."
  });
}
