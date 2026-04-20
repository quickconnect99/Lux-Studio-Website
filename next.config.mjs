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

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns
  }
};

export default nextConfig;
