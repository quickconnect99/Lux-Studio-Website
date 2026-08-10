import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import process from "node:process";
import test from "node:test";

test("applies the hardened public CSP to every route", () => {
  const expression = [
    "import('./next.config.mjs')",
    ".then(async ({ default: config }) =>",
    "console.log(JSON.stringify(await config.headers())))"
  ].join("");
  const environment = {
    ...process.env,
    NODE_ENV: "production"
  } as NodeJS.ProcessEnv;
  delete environment["CI"];
  delete environment["VERCEL_ENV"];
  delete environment["REQUIRE_PRODUCTION_ENV_VALIDATION"];

  const result = spawnSync(
    process.execPath,
    ["--input-type=module", "--eval", expression],
    { cwd: process.cwd(), encoding: "utf8", env: environment }
  );

  assert.equal(result.status, 0, result.stderr);
  const routes = JSON.parse(result.stdout.trim()) as Array<{
    source: string;
    headers: Array<{ key: string; value: string }>;
  }>;
  const globalRoute = routes.find((route) => route.source === "/(.*)");
  const policy = globalRoute?.headers.find(
    (header) => header.key === "Content-Security-Policy"
  )?.value;

  assert.ok(policy);
  assert.match(policy, /script-src 'self' 'unsafe-inline'/);
  assert.doesNotMatch(policy, /'unsafe-eval'/);
  assert.match(policy, /script-src-attr 'none'/);
  assert.match(policy, /worker-src 'self' blob:/);
  assert.match(policy, /manifest-src 'self'/);
  assert.match(policy, /upgrade-insecure-requests/);
});
