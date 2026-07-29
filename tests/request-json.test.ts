import assert from "node:assert/strict";
import test from "node:test";
import { readLimitedJson, RequestBodyTooLargeError } from "../lib/request-json";

test("readLimitedJson parses a body below the limit", async () => {
  const request = new Request("https://example.com/api", {
    method: "POST",
    body: JSON.stringify({ name: "Lux" }),
    headers: { "content-type": "application/json" }
  });

  assert.deepEqual(await readLimitedJson(request, 100), { name: "Lux" });
});

test("readLimitedJson rejects a declared body above the limit", async () => {
  const request = new Request("https://example.com/api", {
    method: "POST",
    body: "{}",
    headers: { "content-length": "200" }
  });

  await assert.rejects(
    () => readLimitedJson(request, 100),
    RequestBodyTooLargeError
  );
});

test("readLimitedJson stops a streamed body above the limit", async () => {
  const request = new Request("https://example.com/api", {
    method: "POST",
    body: JSON.stringify({ brief: "x".repeat(200) })
  });

  await assert.rejects(
    () => readLimitedJson(request, 100),
    RequestBodyTooLargeError
  );
});
