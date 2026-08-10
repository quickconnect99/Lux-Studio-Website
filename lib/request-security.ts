import { isIP } from "node:net";

const supportedProxyIpHeaders = new Set([
  "x-forwarded-for",
  "x-real-ip",
  "x-vercel-forwarded-for"
]);

function resolveTrustedProxyIpHeader(configuredHeader?: string) {
  const normalized = configuredHeader?.trim().toLowerCase();

  if (normalized && supportedProxyIpHeaders.has(normalized)) {
    return normalized;
  }

  return process.env.VERCEL ? "x-vercel-forwarded-for" : "x-forwarded-for";
}

function normalizeForwardedIp(value: string | null) {
  const candidate = value?.split(",")[0]?.trim();
  if (!candidate) {
    return null;
  }

  const unwrapped =
    candidate.startsWith("[") && candidate.endsWith("]")
      ? candidate.slice(1, -1)
      : candidate;

  return isIP(unwrapped) ? unwrapped : null;
}

/**
 * Builds a privacy-minimal rate-limit key from one explicitly trusted proxy
 * header. User-Agent is intentionally excluded because clients can vary it to
 * create unlimited rate-limit partitions.
 */
export function getRequestClientKey(
  headers: Headers,
  configuredHeader = process.env.TRUSTED_PROXY_IP_HEADER
) {
  const trustedHeader = resolveTrustedProxyIpHeader(configuredHeader);
  const clientIp = normalizeForwardedIp(headers.get(trustedHeader));

  return `ip:${clientIp ?? "unknown"}`;
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
    const parsedOrigin = new URL(origin).origin;
    const requestOrigin = new URL(request.url).origin;

    if (parsedOrigin === requestOrigin) {
      return true;
    }

    return configuredSiteUrl
      ? new URL(configuredSiteUrl).origin === parsedOrigin
      : false;
  } catch {
    return false;
  }
}
