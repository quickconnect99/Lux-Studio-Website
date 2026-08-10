import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { createAdminContentSecurityPolicy } from "../lib/admin-content-security-policy";
import {
  themeInitScript,
  themeInitScriptSha256
} from "../lib/theme-init-script";

test("builds a strict production script policy for the admin route", () => {
  const policy = createAdminContentSecurityPolicy({
    nonce: "request-nonce",
    isProduction: true,
    supabaseUrl: "https://project.supabase.co/path"
  });
  const scriptDirective = policy
    .split("; ")
    .find((directive) => directive.startsWith("script-src"));

  assert.equal(
    themeInitScriptSha256,
    `sha256-${createHash("sha256").update(themeInitScript).digest("base64")}`
  );
  assert.match(scriptDirective ?? "", /'nonce-request-nonce'/);
  assert.match(scriptDirective ?? "", /'sha256-[A-Za-z0-9+/=]+'/);
  assert.match(scriptDirective ?? "", /'strict-dynamic'/);
  assert.doesNotMatch(scriptDirective ?? "", /'unsafe-inline'/);
  assert.doesNotMatch(scriptDirective ?? "", /'unsafe-eval'/);
  assert.match(policy, /connect-src 'self' https:\/\/project\.supabase\.co/);
  assert.match(policy, /script-src-attr 'none'/);
  assert.match(policy, /worker-src 'self' blob:/);
  assert.match(policy, /manifest-src 'self'/);
  assert.match(policy, /upgrade-insecure-requests/);
});

test("keeps development tooling working without weakening production", () => {
  const policy = createAdminContentSecurityPolicy({
    nonce: "development-nonce",
    isProduction: false
  });

  assert.match(policy, /script-src .*'unsafe-eval'/);
  assert.match(policy, /connect-src 'self' ws: wss:/);
  assert.doesNotMatch(policy, /upgrade-insecure-requests/);
});

test("does not interpolate malformed or non-http Supabase origins", () => {
  for (const supabaseUrl of [
    "not a URL; script-src *",
    "javascript:alert(1)"
  ]) {
    const policy = createAdminContentSecurityPolicy({
      nonce: "safe-nonce",
      isProduction: true,
      supabaseUrl
    });

    assert.doesNotMatch(policy, /javascript:|script-src \*/);
  }
});
