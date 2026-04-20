import { NextResponse, type NextRequest } from "next/server";

function buildUnauthorizedResponse() {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Admin Area", charset="UTF-8"',
      "Cache-Control": "no-store"
    }
  });
}

function buildMisconfiguredResponse() {
  return new NextResponse("Admin gate is not configured.", {
    status: 503,
    headers: {
      "Cache-Control": "no-store"
    }
  });
}

function decodeBasicAuth(header: string) {
  if (!header.startsWith("Basic ")) {
    return null;
  }

  try {
    const decoded = atob(header.slice(6));
    const separatorIndex = decoded.indexOf(":");

    if (separatorIndex === -1) {
      return null;
    }

    return {
      username: decoded.slice(0, separatorIndex),
      password: decoded.slice(separatorIndex + 1)
    };
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (process.env.NODE_ENV !== "production") {
    return NextResponse.next();
  }

  if (process.env.NEXT_PUBLIC_ENABLE_ADMIN !== "true") {
    return NextResponse.next();
  }

  const expectedUsername = process.env.ADMIN_GATE_USER?.trim();
  const expectedPassword = process.env.ADMIN_GATE_PASSWORD?.trim();

  if (!expectedUsername || !expectedPassword) {
    return buildMisconfiguredResponse();
  }

  const authorizationHeader = request.headers.get("authorization");
  const credentials = authorizationHeader
    ? decodeBasicAuth(authorizationHeader)
    : null;

  if (
    !credentials ||
    credentials.username !== expectedUsername ||
    credentials.password !== expectedPassword
  ) {
    return buildUnauthorizedResponse();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
