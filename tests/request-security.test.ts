import assert from "node:assert/strict";
import test from "node:test";
import {
  getRequestClientKey,
  isAllowedRequestOrigin
} from "../lib/request-security";

test("allows same-origin and explicitly configured request origins", () => {
  const sameOrigin = new Request("https://www.luxstudio.li/api/telemetry", {
    headers: {
      host: "www.luxstudio.li",
      origin: "https://www.luxstudio.li"
    }
  });
  const configuredOrigin = new Request(
    "https://deployment.example/api/telemetry",
    {
      headers: {
        host: "deployment.example",
        origin: "https://www.luxstudio.li"
      }
    }
  );

  assert.equal(isAllowedRequestOrigin(sameOrigin), true);
  assert.equal(
    isAllowedRequestOrigin(configuredOrigin, "https://www.luxstudio.li"),
    true
  );
});

test("rejects malformed and unrelated request origins", () => {
  const unrelated = new Request("https://www.luxstudio.li/api/telemetry", {
    headers: {
      host: "www.luxstudio.li",
      origin: "https://attacker.example"
    }
  });
  const malformed = new Request("https://www.luxstudio.li/api/telemetry", {
    headers: {
      host: "www.luxstudio.li",
      origin: "not a url"
    }
  });

  assert.equal(
    isAllowedRequestOrigin(unrelated, "https://www.luxstudio.li"),
    false
  );
  assert.equal(isAllowedRequestOrigin(malformed), false);
});

test("requires the exact origin instead of accepting a scheme mismatch", () => {
  const request = new Request("https://www.luxstudio.li/api/telemetry", {
    headers: { origin: "http://www.luxstudio.li" }
  });

  assert.equal(isAllowedRequestOrigin(request), false);
});

test("uses only a validated IP from the explicitly trusted proxy header", () => {
  const headers = new Headers({
    "x-forwarded-for": "203.0.113.5, 10.0.0.1",
    "user-agent": "a".repeat(200)
  });

  assert.equal(
    getRequestClientKey(headers, "x-forwarded-for"),
    "ip:203.0.113.5"
  );

  headers.set("user-agent", "an entirely different browser");
  assert.equal(
    getRequestClientKey(headers, "x-forwarded-for"),
    "ip:203.0.113.5"
  );
});

test("does not fall through to attacker-selected forwarding headers", () => {
  const headers = new Headers({
    "x-forwarded-for": "203.0.113.50",
    "x-real-ip": "198.51.100.12"
  });

  assert.equal(getRequestClientKey(headers, "x-real-ip"), "ip:198.51.100.12");
  assert.equal(
    getRequestClientKey(headers, "x-vercel-forwarded-for"),
    "ip:unknown"
  );

  headers.set("x-real-ip", "not-an-ip");
  assert.equal(getRequestClientKey(headers, "x-real-ip"), "ip:unknown");
});
