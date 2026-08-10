import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAllowedRequestOrigin } from "@/lib/request-security";
import { getRequestId, logServerEvent } from "@/lib/server-observability";

export const runtime = "nodejs";

type RevalidateDependencies = {
  checkAdmin: (accessToken: string) => Promise<{
    data: unknown;
    error: unknown;
  }>;
  revalidate: () => void;
};

function createDefaultDependencies(): RevalidateDependencies | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return {
    async checkAdmin(accessToken) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
        global: { headers: { Authorization: `Bearer ${accessToken}` } }
      });

      return supabase.rpc("is_admin");
    },
    revalidate() {
      revalidatePath("/", "layout");
    }
  };
}

/**
 * Called by the admin dashboard right after a successful project or
 * site-settings save. Verifies the caller's own Supabase session against
 * is_admin() (same RLS check the browser client already relies on for the
 * write itself) before busting the cache, so an expired or non-admin
 * session can't force-refresh the public site on demand.
 */
export function createRevalidateHandler(
  dependencies?: RevalidateDependencies | null
) {
  return async function POST(request: Request) {
    const requestId = getRequestId(request.headers);
    const startedAt = Date.now();

    function json(body: Record<string, unknown>, status = 200) {
      return NextResponse.json(body, {
        status,
        headers: {
          "cache-control": "no-store",
          "x-request-id": requestId
        }
      });
    }

    if (!isAllowedRequestOrigin(request)) {
      logServerEvent({
        level: "warn",
        event: "revalidate.origin_rejected",
        requestId
      });
      return json({ message: "This origin is not allowed." }, 403);
    }

    const resolvedDependencies = dependencies ?? createDefaultDependencies();
    if (!resolvedDependencies) {
      logServerEvent({
        level: "error",
        event: "revalidate.unavailable",
        requestId
      });
      return json({ message: "Revalidation is temporarily unavailable." }, 503);
    }

    const accessToken = request.headers
      .get("authorization")
      ?.replace(/^Bearer\s+/i, "")
      .trim();

    if (!accessToken) {
      return json({ message: "Missing admin session." }, 401);
    }

    const { data: isAdmin, error } =
      await resolvedDependencies.checkAdmin(accessToken);

    if (error || isAdmin !== true) {
      logServerEvent({
        level: "warn",
        event: "revalidate.forbidden",
        requestId,
        error
      });
      return json(
        { message: "This session is not authorized to refresh the site." },
        403
      );
    }

    resolvedDependencies.revalidate();

    logServerEvent({
      level: "info",
      event: "revalidate.completed",
      requestId,
      context: { durationMs: Date.now() - startedAt }
    });

    return json({ revalidated: true });
  };
}

export const POST = createRevalidateHandler();
