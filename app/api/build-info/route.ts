import { NextResponse } from "next/server";
import { getRequestId } from "@/lib/server-observability";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Reports which commit is actually running, so the production E2E suite can
 * refuse to test a stale cached build instead of silently passing against
 * the wrong code (see `tests/e2e/global-setup.ts`).
 *
 * `BUILD_SHA` is read at server start, not baked in at build time — CI sets
 * it for the job that runs `next start` before Playwright connects.
 */
export async function GET(request: Request) {
  const requestId = getRequestId(request.headers);

  return NextResponse.json(
    { sha: process.env.BUILD_SHA ?? null },
    {
      headers: {
        "x-request-id": requestId,
        "cache-control": "no-store"
      }
    }
  );
}
