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

test("builds a bounded client key from forwarding headers", () => {
  const headers = new Headers({
    "x-forwarded-for": "203.0.113.5, 10.0.0.1",
    "user-agent": "a".repeat(200)
  });

  assert.equal(getRequestClientKey(headers), `203.0.113.5:${"a".repeat(120)}`);
});
