import { NextResponse } from "next/server";
import { consumeRateLimitAttempt, pruneRateLimitStore } from "@/lib/rate-limit";
import { getRequestId, logServerEvent } from "@/lib/server-observability";
import { readLimitedJson, RequestBodyTooLargeError } from "@/lib/request-json";
import {
  getRequestClientKey,
  isAllowedRequestOrigin
} from "@/lib/request-security";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const allowedMetricNames = new Set(["CLS", "FCP", "INP", "LCP", "TTFB"]);
const TELEMETRY_RATE_LIMIT_MAX_REQUESTS = 60;
const TELEMETRY_RATE_LIMIT_WINDOW_MS = 60_000;
const telemetryRateLimitStore =
  (
    globalThis as typeof globalThis & {
      __telemetryRateLimit?: Map<string, number[]>;
    }
  ).__telemetryRateLimit ?? new Map<string, number[]>();

(
  globalThis as typeof globalThis & {
    __telemetryRateLimit?: Map<string, number[]>;
  }
).__telemetryRateLimit = telemetryRateLimitStore;

let pruneCallCount = 0;

export async function POST(request: Request) {
  if (process.env.NEXT_PUBLIC_ENABLE_TELEMETRY !== "true") {
    return new NextResponse(null, { status: 204 });
  }

  if (!isAllowedRequestOrigin(request)) {
    return NextResponse.json(
      { message: "Metrics cannot be submitted from this origin." },
      { status: 403 }
    );
  }

  pruneCallCount += 1;
  if (pruneCallCount % 100 === 0) {
    pruneRateLimitStore(
      telemetryRateLimitStore,
      TELEMETRY_RATE_LIMIT_WINDOW_MS
    );
  }

  if (
    !consumeRateLimitAttempt(telemetryRateLimitStore, {
      key: getRequestClientKey(request.headers),
      maxAttempts: TELEMETRY_RATE_LIMIT_MAX_REQUESTS,
      windowMs: TELEMETRY_RATE_LIMIT_WINDOW_MS
    })
  ) {
    return NextResponse.json(
      { message: "Too many metric submissions." },
      {
        status: 429,
        headers: { "retry-after": "60" }
      }
    );
  }

  try {
    const requestId = getRequestId(request.headers);
    const payload = (await readLimitedJson(request, 2 * 1024)) as Record<
      string,
      unknown
    >;
    const name = typeof payload?.name === "string" ? payload.name : "";
    const value =
      typeof payload?.value === "number" && Number.isFinite(payload.value)
        ? payload.value
        : null;

    if (!allowedMetricNames.has(name) || value === null) {
      return NextResponse.json(
        { message: "Invalid web-vital metric." },
        { status: 400 }
      );
    }

    logServerEvent({
      level: "info",
      event: "web_vital",
      requestId,
      context: {
        name,
        value,
        rating:
          typeof payload.rating === "string"
            ? payload.rating.slice(0, 24)
            : undefined,
        navigationType:
          typeof payload.navigationType === "string"
            ? payload.navigationType.slice(0, 32)
            : undefined
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof RequestBodyTooLargeError
            ? "Metric payload is too large."
            : "Metric payload could not be parsed."
      },
      {
        status: error instanceof RequestBodyTooLargeError ? 413 : 400
      }
    );
  }
}
