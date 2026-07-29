/**
 * Builds a privacy-minimal rate-limit key from proxy IP headers and a bounded
 * user-agent fragment.
 */
export function getRequestClientKey(headers: Headers) {
  const forwardedFor = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = headers.get("x-real-ip")?.trim();
  const userAgent = headers.get("user-agent")?.trim() ?? "unknown";

  return `${forwardedFor || realIp || "unknown"}:${userAgent.slice(0, 120)}`;
}

/**
 * Applies a same-origin check to browser requests with an `Origin` header.
 *
 * Requests without `Origin` are allowed because server-to-server clients often
 * omit it; endpoint authentication and rate limiting still apply separately.
 */
export function isAllowedRequestOrigin(
  request: Request,
  configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
) {
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

    return configuredSiteUrl
      ? new URL(configuredSiteUrl).host === originHost
      : false;
  } catch {
    return false;
  }
}
