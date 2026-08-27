import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { isAllowedRequestOrigin } from "@/lib/request-security";
import { getRequestId, logServerEvent } from "@/lib/server-observability";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import type { AdminAccountSummary } from "@/lib/admin-types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type CheckResult = { data: unknown; error: unknown };

type AdminUsersDependencies = {
  checkAdmin: (accessToken: string) => Promise<CheckResult>;
  getCallerId: (accessToken: string) => Promise<string | null>;
  listAuthUsers: () => Promise<{
    data: Array<{
      id: string;
      email: string | null;
      createdAt: string;
      lastSignInAt: string | null;
    }> | null;
    error: unknown;
  }>;
  listAdminIds: () => Promise<{ data: string[] | null; error: unknown }>;
  addAdmin: (userId: string) => Promise<{ error: unknown }>;
  removeAdmin: (userId: string) => Promise<{ error: unknown }>;
};

function createDefaultDependencies(): AdminUsersDependencies | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const adminClient = createAdminSupabaseClient();

  if (!supabaseUrl || !supabaseAnonKey || !adminClient) {
    return null;
  }

  function createCallerClient(accessToken: string) {
    return createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${accessToken}` } }
    });
  }

  return {
    async checkAdmin(accessToken) {
      return createCallerClient(accessToken).rpc("is_admin");
    },
    async getCallerId(accessToken) {
      const { data, error } =
        await createCallerClient(accessToken).auth.getUser();
      return error ? null : (data.user?.id ?? null);
    },
    async listAuthUsers() {
      const { data, error } = await adminClient.auth.admin.listUsers({
        page: 1,
        perPage: 200
      });

      if (error || !data) {
        return { data: null, error };
      }

      return {
        data: data.users.map((user) => ({
          id: user.id,
          email: user.email ?? null,
          createdAt: user.created_at,
          lastSignInAt: user.last_sign_in_at ?? null
        })),
        error: null
      };
    },
    async listAdminIds() {
      const { data, error } = await adminClient
        .from("admin_users")
        .select("user_id");

      if (error || !data) {
        return { data: null, error };
      }

      return {
        data: data.map((row) => row.user_id as string),
        error: null
      };
    },
    async addAdmin(userId) {
      const { error } = await adminClient
        .from("admin_users")
        .upsert({ user_id: userId }, { onConflict: "user_id" });
      return { error };
    },
    async removeAdmin(userId) {
      const { error } = await adminClient
        .from("admin_users")
        .delete()
        .eq("user_id", userId);
      return { error };
    }
  };
}

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  requestId: string
) {
  return NextResponse.json(body, {
    status,
    headers: {
      "cache-control": "no-store",
      "x-request-id": requestId
    }
  });
}

async function requireAdmin(
  request: Request,
  dependencies: AdminUsersDependencies,
  requestId: string
) {
  if (!isAllowedRequestOrigin(request)) {
    logServerEvent({
      level: "warn",
      event: "admin_users.origin_rejected",
      requestId
    });
    return {
      ok: false as const,
      response: jsonResponse(
        { message: "This origin is not allowed." },
        403,
        requestId
      )
    };
  }

  const accessToken = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "")
    .trim();

  if (!accessToken) {
    return {
      ok: false as const,
      response: jsonResponse(
        { message: "Missing admin session." },
        401,
        requestId
      )
    };
  }

  const { data: isAdmin, error } = await dependencies.checkAdmin(accessToken);

  if (error || isAdmin !== true) {
    logServerEvent({
      level: "warn",
      event: "admin_users.forbidden",
      requestId,
      error
    });
    return {
      ok: false as const,
      response: jsonResponse(
        { message: "This session is not authorized to manage admin access." },
        403,
        requestId
      )
    };
  }

  return { ok: true as const, accessToken };
}

/**
 * Lists every Supabase auth account alongside its `admin_users` membership so
 * the workspace owner can see, at a glance, who can already sign in to the
 * dashboard and who is still waiting to be approved.
 */
export function createAdminUsersGetHandler(
  dependencies?: AdminUsersDependencies
) {
  return async function GET(request: Request) {
    const requestId = getRequestId(request.headers);
    const resolvedDependencies = dependencies ?? createDefaultDependencies();

    if (!resolvedDependencies) {
      return jsonResponse(
        { message: "User management is unavailable." },
        503,
        requestId
      );
    }

    const auth = await requireAdmin(request, resolvedDependencies, requestId);
    if (!auth.ok) {
      return auth.response;
    }

    const [usersResult, adminIdsResult] = await Promise.all([
      resolvedDependencies.listAuthUsers(),
      resolvedDependencies.listAdminIds()
    ]);

    if (!usersResult.data || !adminIdsResult.data) {
      logServerEvent({
        level: "error",
        event: "admin_users.list_failed",
        requestId,
        error: usersResult.error ?? adminIdsResult.error
      });
      return jsonResponse(
        { message: "Could not load Supabase accounts." },
        500,
        requestId
      );
    }

    const adminIds = new Set(adminIdsResult.data);
    const accounts: AdminAccountSummary[] = usersResult.data
      .map((user) => ({
        ...user,
        isAdmin: adminIds.has(user.id)
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return jsonResponse({ accounts }, 200, requestId);
  };
}

/** Grants an existing Supabase auth account access to the admin workspace. */
export function createAdminUsersPostHandler(
  dependencies?: AdminUsersDependencies
) {
  return async function POST(request: Request) {
    const requestId = getRequestId(request.headers);
    const resolvedDependencies = dependencies ?? createDefaultDependencies();

    if (!resolvedDependencies) {
      return jsonResponse(
        { message: "User management is unavailable." },
        503,
        requestId
      );
    }

    const auth = await requireAdmin(request, resolvedDependencies, requestId);
    if (!auth.ok) {
      return auth.response;
    }

    const body = await request.json().catch(() => null);
    const userId = typeof body?.userId === "string" ? body.userId : null;

    if (!userId || !UUID_PATTERN.test(userId)) {
      return jsonResponse(
        { message: "A valid userId is required." },
        400,
        requestId
      );
    }

    const { error } = await resolvedDependencies.addAdmin(userId);

    if (error) {
      logServerEvent({
        level: "error",
        event: "admin_users.grant_failed",
        requestId,
        error
      });
      return jsonResponse(
        { message: "Could not grant admin access." },
        500,
        requestId
      );
    }

    logServerEvent({ level: "info", event: "admin_users.granted", requestId });
    return jsonResponse({ ok: true }, 200, requestId);
  };
}

/** Revokes an admin account's access to the workspace. */
export function createAdminUsersDeleteHandler(
  dependencies?: AdminUsersDependencies
) {
  return async function DELETE(request: Request) {
    const requestId = getRequestId(request.headers);
    const resolvedDependencies = dependencies ?? createDefaultDependencies();

    if (!resolvedDependencies) {
      return jsonResponse(
        { message: "User management is unavailable." },
        503,
        requestId
      );
    }

    const auth = await requireAdmin(request, resolvedDependencies, requestId);
    if (!auth.ok) {
      return auth.response;
    }

    const body = await request.json().catch(() => null);
    const userId = typeof body?.userId === "string" ? body.userId : null;

    if (!userId || !UUID_PATTERN.test(userId)) {
      return jsonResponse(
        { message: "A valid userId is required." },
        400,
        requestId
      );
    }

    const callerId = await resolvedDependencies.getCallerId(auth.accessToken);
    if (callerId && callerId === userId) {
      return jsonResponse(
        { message: "You cannot revoke your own admin access." },
        400,
        requestId
      );
    }

    const { error } = await resolvedDependencies.removeAdmin(userId);

    if (error) {
      logServerEvent({
        level: "error",
        event: "admin_users.revoke_failed",
        requestId,
        error
      });
      return jsonResponse(
        { message: "Could not revoke admin access." },
        500,
        requestId
      );
    }

    logServerEvent({ level: "info", event: "admin_users.revoked", requestId });
    return jsonResponse({ ok: true }, 200, requestId);
  };
}

export const GET = createAdminUsersGetHandler();
export const POST = createAdminUsersPostHandler();
export const DELETE = createAdminUsersDeleteHandler();
