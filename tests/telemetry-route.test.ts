import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { POST } from "../app/api/telemetry/route";

const originalEnabled = process.env.NEXT_PUBLIC_ENABLE_TELEMETRY;

afterEach(() => {
  if (originalEnabled === undefined) {
    delete process.env.NEXT_PUBLIC_ENABLE_TELEMETRY;
  } else {
    process.env.NEXT_PUBLIC_ENABLE_TELEMETRY = originalEnabled;
  }
});

function createRequest(body: string, origin = "https://www.luxstudio.li") {
  return new Request("https://www.luxstudio.li/api/telemetry", {
    method: "POST",
    body,
    headers: {
      "content-type": "application/json",
      origin,
      "x-forwarded-for": "192.0.2.44",
      "x-request-id": "telemetry-test-request"
    }
  });
}

test("returns an observable no-store response when telemetry is disabled", async () => {
  delete process.env.NEXT_PUBLIC_ENABLE_TELEMETRY;

  const response = await POST(createRequest("{}"));

  assert.equal(response.status, 204);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("x-request-id"), "telemetry-test-request");
});

test("rejects cross-origin telemetry before parsing the metric", async () => {
  process.env.NEXT_PUBLIC_ENABLE_TELEMETRY = "true";

  const response = await POST(createRequest("{}", "https://attacker.example"));

  assert.equal(response.status, 403);
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("accepts supported finite metrics and rejects invalid payloads", async () => {
  process.env.NEXT_PUBLIC_ENABLE_TELEMETRY = "true";

  const accepted = await POST(
    createRequest(JSON.stringify({ name: "LCP", value: 123.4, rating: "good" }))
  );
  const invalid = await POST(
    createRequest(JSON.stringify({ name: "custom", value: 1 }))
  );
  const malformed = await POST(createRequest("{"));

  assert.equal(accepted.status, 204);
  assert.equal(invalid.status, 400);
  assert.equal(malformed.status, 400);
});
