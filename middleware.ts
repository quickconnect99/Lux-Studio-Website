import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_GATE_COOKIE,
  isAdminGateConfigured,
  verifyAdminGateCookieValue
} from "@/lib/admin-gate";

function buildMisconfiguredResponse() {
  return new NextResponse("Admin gate is not configured.", {
    status: 503,
    headers: { "Cache-Control": "no-store" }
  });
}

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (process.env.NODE_ENV !== "production") {
    return NextResponse.next();
  }

  if (process.env.NEXT_PUBLIC_ENABLE_ADMIN !== "true") {
    return NextResponse.next();
  }

  if (!isAdminGateConfigured()) {
    return buildMisconfiguredResponse();
  }

  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  const hasGateSession = await verifyAdminGateCookieValue(
    request.cookies.get(ADMIN_GATE_COOKIE)?.value
  );

  if (!hasGateSession) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
