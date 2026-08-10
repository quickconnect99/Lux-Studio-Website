import process from "node:process";
import { pathToFileURL } from "node:url";

const localHostnames = new Set(["127.0.0.1", "::1", "localhost"]);

function isValidHttpsUrl(value, { allowLocalhost = false } = {}) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (allowLocalhost || !localHostnames.has(url.hostname.toLowerCase()))
    );
  } catch {
    return false;
  }
}

function hasValue(value) {
  return Boolean(value?.trim());
}

/**
 * Fails closed in CI and real production deployments without making a plain
 * local `next build` depend on live credentials. Non-Vercel production hosts
 * opt in with REQUIRE_PRODUCTION_ENV_VALIDATION=true.
 */
export function getProductionEnvironmentErrors(environment = process.env) {
  const isCi = environment.CI === "true" || environment.CI === "1";
  const isProductionDeployment =
    environment.VERCEL_ENV === "production" ||
    environment.REQUIRE_PRODUCTION_ENV_VALIDATION === "true";

  if (!isCi && !isProductionDeployment) {
    return [];
  }

  const errors = [];
  const siteUrl = environment.NEXT_PUBLIC_SITE_URL?.trim() ?? "";

  if (!isValidHttpsUrl(siteUrl)) {
    errors.push(
      "NEXT_PUBLIC_SITE_URL must be a non-local HTTPS URL in CI and production."
    );
  }

  if (!isProductionDeployment) {
    return errors;
  }

  const requiredProductionValues = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "INQUIRY_RATE_LIMIT_SECRET",
    "CRON_SECRET"
  ];

  for (const key of requiredProductionValues) {
    if (!hasValue(environment[key])) {
      errors.push(`${key} is required for a production deployment.`);
    }
  }

  for (const key of ["INQUIRY_RATE_LIMIT_SECRET", "CRON_SECRET"]) {
    const value = environment[key]?.trim() ?? "";
    if (value && value.length < 32) {
      errors.push(`${key} must contain at least 32 characters in production.`);
    }
  }

  if (
    hasValue(environment.NEXT_PUBLIC_SUPABASE_URL) &&
    !isValidHttpsUrl(environment.NEXT_PUBLIC_SUPABASE_URL)
  ) {
    errors.push("NEXT_PUBLIC_SUPABASE_URL must be an HTTPS URL in production.");
  }

  if (environment.NEXT_PUBLIC_ENABLE_ADMIN_DEMO === "true") {
    errors.push(
      "NEXT_PUBLIC_ENABLE_ADMIN_DEMO must never be true in production."
    );
  }

  const resendConfigured = hasValue(environment.RESEND_API_KEY);
  const recipientConfigured = hasValue(environment.INQUIRY_EMAIL_TO);
  if (resendConfigured !== recipientConfigured) {
    errors.push(
      "RESEND_API_KEY and INQUIRY_EMAIL_TO must either both be configured or both be omitted."
    );
  }

  const retentionDays = Number(environment.INQUIRY_RETENTION_DAYS ?? "365");
  if (
    !Number.isInteger(retentionDays) ||
    retentionDays < 30 ||
    retentionDays > 3650
  ) {
    errors.push("INQUIRY_RETENTION_DAYS must be an integer from 30 to 3650.");
  }

  return errors;
}

export function validateProductionEnvironment(environment = process.env) {
  const errors = getProductionEnvironmentErrors(environment);
  if (errors.length > 0) {
    throw new Error(
      `[production-env] Invalid deployment configuration:\n- ${errors.join("\n- ")}`
    );
  }
}

const isDirectExecution =
  process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;

if (isDirectExecution) {
  try {
    validateProductionEnvironment();
    console.log("Production environment validation passed.");
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
