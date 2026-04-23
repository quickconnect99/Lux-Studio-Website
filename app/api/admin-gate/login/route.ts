import { NextResponse } from "next/server";
import {
  ADMIN_GATE_COOKIE,
  ADMIN_GATE_MAX_AGE_SECONDS,
  areAdminGateCredentialsValid,
  createAdminGateCookieValue,
  isAdminGateConfigured
} from "@/lib/admin-gate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LOGIN_RATE_LIMIT_MAX = 5;
const LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

const loginRateLimitStore =
  (
    globalThis as typeof globalThis & {
      __loginRateLimit?: Map<string, number[]>;
    }
  ).__loginRateLimit ?? new Map<string, number[]>();

(
  globalThis as typeof globalThis & {
    __loginRateLimit?: Map<string, number[]>;
  }
).__loginRateLimit = loginRateLimitStore;

function getLoginClientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return forwarded || realIp || "unknown";
}

function isLoginRateLimited(key: string) {
  const now = Date.now();
  const recent = (loginRateLimitStore.get(key) ?? []).filter(
    (t) => now - t < LOGIN_RATE_LIMIT_WINDOW_MS
  );

  if (recent.length >= LOGIN_RATE_LIMIT_MAX) {
    loginRateLimitStore.set(key, recent);
    return true;
  }

  recent.push(now);
  loginRateLimitStore.set(key, recent);
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

function normalizeRedirectTarget(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/admin")) {
    return "/admin";
  }

  return value === "/admin/login" ? "/admin" : value;
}

export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json(
      { message: "The admin gate could not be opened from this origin." },
      { status: 403 }
    );
  }

  if (!isAdminGateConfigured()) {
    return NextResponse.json(
      { message: "Admin gate is not configured." },
      { status: 503 }
    );
  }

  const clientKey = getLoginClientKey(request);
  if (isLoginRateLimited(clientKey)) {
    return NextResponse.json(
      { message: "Too many login attempts. Please try again in 15 minutes." },
      { status: 429 }
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "The login payload could not be parsed." },
      { status: 400 }
    );
  }

  const body =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};

  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const redirectTo = normalizeRedirectTarget(body.redirectTo);

  if (!areAdminGateCredentialsValid(username, password)) {
    return NextResponse.json(
      { message: "Invalid admin gate credentials." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ redirectTo });
  response.cookies.set({
    name: ADMIN_GATE_COOKIE,
    value: await createAdminGateCookieValue(username),
    httpOnly: true,
    maxAge: ADMIN_GATE_MAX_AGE_SECONDS,
    path: "/admin",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production"
  });

  return response;
}
