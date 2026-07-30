import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { getRequestId, logServerEvent } from "../lib/server-observability";

const originalConsole = {
  error: console.error,
  info: console.info,
  warn: console.warn
};

afterEach(() => {
  console.error = originalConsole.error;
  console.info = originalConsole.info;
  console.warn = originalConsole.warn;
});

test("preserves safe request IDs and replaces malformed values", () => {
  assert.equal(
    getRequestId(new Headers({ "x-request-id": "request_1234" })),
    "request_1234"
  );
  assert.match(
    getRequestId(new Headers({ "x-request-id": "<unsafe>" })),
    /^[0-9a-f-]{36}$/
  );
});

test("writes structured events without serializing arbitrary error details", () => {
  let logged = "";
  console.error = (message?: unknown) => {
    logged = String(message);
  };

  logServerEvent({
    level: "error",
    event: "inquiry.failed",
    requestId: "request_1234",
    context: { attempt: 2 },
    error: {
      name: "DatabaseError",
      code: "42501",
      status: 403,
      secret: "must-not-be-logged"
    }
  });

  const payload = JSON.parse(logged) as Record<string, unknown>;
  assert.equal(payload.event, "inquiry.failed");
  assert.equal(payload.attempt, 2);
  assert.equal(payload.errorType, "DatabaseError");
  assert.equal(payload.errorCode, "42501");
  assert.equal(payload.errorStatus, 403);
  assert.equal("secret" in payload, false);
});

test("routes informational and warning events to their matching sinks", () => {
  const messages: string[] = [];
  console.info = (message?: unknown) => messages.push(`info:${message}`);
  console.warn = (message?: unknown) => messages.push(`warn:${message}`);

  logServerEvent({
    level: "info",
    event: "test.info",
    requestId: "request_1234"
  });
  logServerEvent({
    level: "warn",
    event: "test.warn",
    requestId: "request_1234",
    error: "unexpected"
  });

  assert.equal(messages.length, 2);
  assert.match(messages[0], /^info:/);
  assert.match(messages[1], /^warn:/);
  assert.match(messages[1], /"errorType":"string"/);
});
