import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import test from "node:test";

const validatorPath = path.join(
  process.cwd(),
  "scripts",
  "validate-production-env.mjs"
);
const controlledKeys = [
  "CI",
  "VERCEL_ENV",
  "REQUIRE_PRODUCTION_ENV_VALIDATION",
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "INQUIRY_RATE_LIMIT_SECRET",
  "CRON_SECRET",
  "NEXT_PUBLIC_ENABLE_ADMIN_DEMO",
  "SMTP_HOST",
  "SMTP_USER",
  "SMTP_PASSWORD",
  "INQUIRY_EMAIL_TO",
  "INQUIRY_RETENTION_DAYS"
];

function runValidator(overrides: Record<string, string> = {}) {
  const environment = { ...process.env };
  for (const key of controlledKeys) {
    delete environment[key];
  }

  return spawnSync(process.execPath, [validatorPath], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: { ...environment, ...overrides }
  });
}

test("does not require deployment credentials for ordinary local work", () => {
  assert.equal(runValidator().status, 0);
});

test("requires a canonical HTTPS site URL in CI", () => {
  const result = runValidator({ CI: "true" });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /NEXT_PUBLIC_SITE_URL/);
  assert.equal(
    runValidator({ CI: "true", NEXT_PUBLIC_SITE_URL: "https://luxstudio.li" })
      .status,
    0
  );
});

test("fails closed for an incompletely configured production deployment", () => {
  const invalid = runValidator({
    VERCEL_ENV: "production",
    NEXT_PUBLIC_SITE_URL: "https://luxstudio.li"
  });

  assert.notEqual(invalid.status, 0);
  assert.match(invalid.stderr, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(invalid.stderr, /CRON_SECRET/);

  const valid = runValidator({
    VERCEL_ENV: "production",
    NEXT_PUBLIC_SITE_URL: "https://luxstudio.li",
    NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
    SUPABASE_SERVICE_ROLE_KEY: "service-key",
    INQUIRY_RATE_LIMIT_SECRET: "r".repeat(32),
    CRON_SECRET: "c".repeat(32),
    INQUIRY_RETENTION_DAYS: "365"
  });
  assert.equal(valid.status, 0, valid.stderr);
});

test("rejects weak production-only secrets", () => {
  const result = runValidator({
    VERCEL_ENV: "production",
    NEXT_PUBLIC_SITE_URL: "https://luxstudio.li",
    NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
    SUPABASE_SERVICE_ROLE_KEY: "service-key",
    INQUIRY_RATE_LIMIT_SECRET: "too-short",
    CRON_SECRET: "also-too-short",
    INQUIRY_RETENTION_DAYS: "365"
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /at least 32 characters/);
});
