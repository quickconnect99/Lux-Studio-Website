import { validateProductionEnvironment } from "./scripts/validate-production-env.mjs";

validateProductionEnvironment();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const remotePatterns = [];
let supabaseOrigin = "";
const isProduction = process.env.NODE_ENV === "production";

if (supabaseUrl) {
  try {
    const { protocol, hostname, port } = new URL(supabaseUrl);
    supabaseOrigin = `${protocol}//${hostname}${port ? `:${port}` : ""}`;

    remotePatterns.push({
      protocol: protocol.replace(":", ""),
      hostname,
      port,
      pathname: "/storage/v1/object/public/**"
    });
  } catch {
    console.warn(
      "[next.config] NEXT_PUBLIC_SUPABASE_URL is not a valid URL. Remote image patterns were not added."
    );
  }
}

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"}`,
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  `img-src 'self' data: blob: https:${supabaseOrigin ? ` ${supabaseOrigin}` : ""}`,
  `media-src 'self' blob: https:${supabaseOrigin ? ` ${supabaseOrigin}` : ""}`,
  `connect-src 'self'${supabaseOrigin ? ` ${supabaseOrigin}` : ""}`,
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "frame-src https://www.youtube-nocookie.com https://www.youtube.com https://player.vimeo.com",
  isProduction ? "upgrade-insecure-requests" : ""
]
  .filter(Boolean)
  .join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload"
  }
];
const repositoryMediaCacheHeaders = [
  {
    key: "Cache-Control",
    value: "public, max-age=3600, stale-while-revalidate=86400"
  }
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR?.trim() || ".next",
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      { source: "/images/:path*", headers: repositoryMediaCacheHeaders },
      { source: "/media/:path*", headers: repositoryMediaCacheHeaders }
    ];
  },
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    qualities: [75, 90, 95],
    remotePatterns
  }
};

export default nextConfig;
