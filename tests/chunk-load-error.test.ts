import assert from "node:assert/strict";
import test from "node:test";
import { isChunkLoadError } from "../lib/chunk-load-error";

test("recognizes common stale deployment chunk errors", () => {
  assert.equal(
    isChunkLoadError(
      new Error(
        "Loading chunk 925 failed. (error: https://example.com/_next/static/chunks/925.js)"
      )
    ),
    true
  );
  assert.equal(
    isChunkLoadError(
      new TypeError("Failed to fetch dynamically imported module")
    ),
    true
  );
  assert.equal(isChunkLoadError("ChunkLoadError: missing asset"), true);
});

test("does not classify unrelated admin failures as chunk errors", () => {
  assert.equal(isChunkLoadError(new Error("Database request failed")), false);
  assert.equal(isChunkLoadError(null), false);
});
