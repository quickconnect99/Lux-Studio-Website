import { NextResponse } from "next/server";
import {
  INQUIRY_RATE_LIMIT_MAX_REQUESTS,
  INQUIRY_RATE_LIMIT_WINDOW_MS,
  getInquiryProtectionIssue,
  parseInquiryServiceType,
  sanitizeInquiry,
  validateInquiry
} from "@/lib/inquiry";
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

function pruneRateLimitStore() {
  const now = Date.now();
  for (const [key, timestamps] of rateLimitStore) {
    const recent = timestamps.filter((t) => now - t < INQUIRY_RATE_LIMIT_WINDOW_MS);
    if (recent.length === 0) {
      rateLimitStore.delete(key);
    } else {
      rateLimitStore.set(key, recent);
    }
  }
}

let pruneCallCount = 0;

function isRateLimited(key: string) {
  pruneCallCount += 1;
  if (pruneCallCount % 50 === 0) {
    pruneRateLimitStore();
  }

  const now = Date.now();
  const recentRequests = (rateLimitStore.get(key) ?? []).filter(
    (timestamp) => now - timestamp < INQUIRY_RATE_LIMIT_WINDOW_MS
  );

  if (recentRequests.length >= INQUIRY_RATE_LIMIT_MAX_REQUESTS) {
    rateLimitStore.set(key, recentRequests);
    return true;
  }

  recentRequests.push(now);
  rateLimitStore.set(key, recentRequests);
  return false;
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
  if (!isAllowedOrigin(request)) {
    return NextResponse.json(
      { message: "The inquiry could not be submitted from this origin." },
      { status: 403 }
    );
  }

  if (!isServiceRoleConfigured()) {
    return NextResponse.json(
      {
        message:
          "Inquiry endpoint is not configured. Add SUPABASE_SERVICE_ROLE_KEY on the server."
      },
      { status: 503 }
    );
  }

  const clientKey = getClientKey(request.headers);
  if (isRateLimited(clientKey)) {
    return NextResponse.json(
      { message: "Too many inquiries from this browser. Please try again later." },
      { status: 429 }
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
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
    return NextResponse.json(
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
    return NextResponse.json({ message: protectionIssue }, { status: 400 });
  }

  const supabase = createAdminSupabaseClient();

  if (!supabase) {
    return NextResponse.json(
      { message: "Supabase admin client could not be created." },
      { status: 503 }
    );
  }

  const { error } = await supabase.from("inquiries").insert({
    name: inquiry.name,
    email: inquiry.email,
    company: inquiry.company,
    service_type: inquiry.serviceType,
    brief: inquiry.brief
  });

  if (error) {
    console.error("[inquiries] Failed to save inquiry", error);
    return NextResponse.json(
      { message: "The inquiry could not be saved." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Inquiry received - we'll be in touch within 24-48 hours."
  });
}
