import { themeInitScriptSha256 } from "@/lib/theme-init-script";

interface AdminContentSecurityPolicyOptions {
  nonce: string;
  isProduction: boolean;
  supabaseUrl?: string;
}

function getHttpOrigin(value: string | undefined) {
  if (!value) {
    return "";
  }

  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:"
      ? url.origin
      : "";
  } catch {
    return "";
  }
}

export function createAdminContentSecurityPolicy({
  nonce,
  isProduction,
  supabaseUrl
}: AdminContentSecurityPolicyOptions) {
  const supabaseOrigin = getHttpOrigin(supabaseUrl);

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    `script-src 'self' 'nonce-${nonce}' '${themeInitScriptSha256}' 'strict-dynamic'${
      isProduction ? "" : " 'unsafe-eval'"
    }`,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    `img-src 'self' data: blob: https:${supabaseOrigin ? ` ${supabaseOrigin}` : ""}`,
    `media-src 'self' blob: https:${supabaseOrigin ? ` ${supabaseOrigin}` : ""}`,
    `connect-src 'self'${isProduction ? "" : " ws: wss:"}${
      supabaseOrigin ? ` ${supabaseOrigin}` : ""
    }`,
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "frame-src https://www.youtube-nocookie.com https://www.youtube.com https://player.vimeo.com",
    isProduction ? "upgrade-insecure-requests" : ""
  ]
    .filter(Boolean)
    .join("; ");
}
