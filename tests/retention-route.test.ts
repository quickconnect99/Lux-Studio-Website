import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { GET } from "../app/api/admin/retention/route";

const originalEnvironment = {
  CRON_SECRET: process.env.CRON_SECRET,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
};

afterEach(() => {
  for (const [key, value] of Object.entries(originalEnvironment)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});

function createRequest(authorization?: string) {
  return new Request("https://www.luxstudio.li/api/admin/retention", {
    headers: {
      ...(authorization ? { authorization } : {}),
      "x-request-id": "retention-test-request"
    }
  });
}

test("does not run retention without the configured cron bearer secret", async () => {
  process.env.CRON_SECRET = "configured-secret";

  const response = await GET(createRequest("Bearer wrong-secret"));

  assert.equal(response.status, 401);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("x-request-id"), "retention-test-request");
});

test("fails safely when the cron is authorized but storage is unavailable", async () => {
  process.env.CRON_SECRET = "configured-secret";
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;

  const response = await GET(createRequest("Bearer configured-secret"));

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    message: "Retention service is unavailable."
  });
});
