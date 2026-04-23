const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const remotePatterns = [];

if (supabaseUrl) {
  try {
    const { protocol, hostname, port } = new URL(supabaseUrl);

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

const securityHeaders = [
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

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns,
    quality: 90
  }
};

export default nextConfig;
