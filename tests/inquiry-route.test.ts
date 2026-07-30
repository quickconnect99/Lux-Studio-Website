import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { POST } from "../app/api/inquiries/route";

const originalEnvironment = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
};
const validPayload = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  company: "Analytical Studio",
  serviceType: "Brand Campaign",
  brief: "We need a complete campaign with film and still photography.",
  website: "",
  startedAt: Date.now() - 10_000
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

function createRequest(body: string, headers: Record<string, string> = {}) {
  return new Request("https://www.luxstudio.li/api/inquiries", {
    method: "POST",
    body,
    headers: {
      "content-type": "application/json",
      host: "www.luxstudio.li",
      ...headers
    }
  });
}

test("rejects honeypot submissions before service configuration and rate limiting", async () => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;

  const response = await POST(
    createRequest(JSON.stringify({ ...validPayload, website: "bot.example" }))
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    message: "The inquiry could not be submitted."
  });
});

test("returns a clear unavailable response for valid requests without service credentials", async () => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;

  const response = await POST(createRequest(JSON.stringify(validPayload)));

  assert.equal(response.status, 503);
  assert.match(
    String((await response.json()).message),
    /SUPABASE_SERVICE_ROLE_KEY/
  );
  assert.match(response.headers.get("x-request-id") ?? "", /^[0-9a-f-]{36}$/);
});

test("rejects malformed and oversized JSON before backend work", async () => {
  const malformed = await POST(createRequest("{"));
  assert.equal(malformed.status, 400);

  const oversized = await POST(
    createRequest("{}", { "content-length": String(64 * 1024) })
  );
  assert.equal(oversized.status, 413);
});
