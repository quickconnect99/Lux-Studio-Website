import type { FullConfig } from "@playwright/test";

/**
 * Refuses to run the production E2E suite against a stale cached build.
 *
 * Only active when both `PLAYWRIGHT_USE_PRODUCTION` and `BUILD_SHA` are set
 * (the CI job for this suite) — local development against `next dev` has
 * neither and this is a silent no-op.
 */
export default async function globalSetup(config: FullConfig) {
  const expectedSha = process.env.BUILD_SHA;
  if (!expectedSha || process.env.PLAYWRIGHT_USE_PRODUCTION !== "true") {
    return;
  }

  const baseURL = config.projects[0]?.use?.baseURL;
  if (!baseURL) {
    throw new Error(
      "global-setup: no baseURL configured, cannot verify the build identity."
    );
  }

  const response = await fetch(`${baseURL}/api/build-info`);
  if (!response.ok) {
    throw new Error(
      `global-setup: /api/build-info returned ${response.status}; the production server may not be the build this CI run produced.`
    );
  }

  const body = (await response.json()) as { sha: string | null };

  if (body.sha !== expectedSha) {
    throw new Error(
      `global-setup: production server is running build "${body.sha}", expected "${expectedSha}". Refusing to run the E2E suite against a build that does not match this run's commit.`
    );
  }

  console.log(`[global-setup] Verified production build SHA ${body.sha}.`);
}
