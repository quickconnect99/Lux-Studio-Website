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
  const requestId = getRequestId(request.headers);

  function response(body: Record<string, unknown> | null, status: number) {
    const headers = {
      "cache-control": "no-store",
      "x-request-id": requestId
    };

    return body
      ? NextResponse.json(body, { status, headers })
      : new NextResponse(null, { status, headers });
  }

  if (process.env.NEXT_PUBLIC_ENABLE_TELEMETRY !== "true") {
    return response(null, 204);
  }

  if (!isAllowedRequestOrigin(request)) {
    logServerEvent({
      level: "warn",
      event: "web_vital.origin_rejected",
      requestId
    });
    return response(
      { message: "Metrics cannot be submitted from this origin." },
      403
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
    logServerEvent({
      level: "warn",
      event: "web_vital.rate_limited",
      requestId
    });
    const limitedResponse = response(
      { message: "Too many metric submissions." },
      429
    );
    limitedResponse.headers.set("retry-after", "60");
    return limitedResponse;
  }

  try {
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
      logServerEvent({
        level: "warn",
        event: "web_vital.invalid",
        requestId
      });
      return response({ message: "Invalid web-vital metric." }, 400);
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

    return response(null, 204);
  } catch (error) {
    const tooLarge = error instanceof RequestBodyTooLargeError;
    logServerEvent({
      level: "warn",
      event: tooLarge ? "web_vital.too_large" : "web_vital.parse_failed",
      requestId,
      error
    });
    return response(
      {
        message: tooLarge
          ? "Metric payload is too large."
          : "Metric payload could not be parsed."
      },
      tooLarge ? 413 : 400
    );
  }
}
