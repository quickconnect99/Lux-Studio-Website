import assert from "node:assert/strict";
import test from "node:test";
import {
  clearRateLimit,
  consumeRateLimitAttempt,
  isRateLimited,
  pruneRateLimitStore,
  recordRateLimitAttempt
} from "../lib/rate-limit";

const options = {
  key: "client",
  maxAttempts: 2,
  windowMs: 1_000
};

test("limits only after the configured number of attempts", () => {
  const store = new Map<string, number[]>();

  recordRateLimitAttempt(store, { ...options, now: 100 });
  assert.equal(isRateLimited(store, { ...options, now: 200 }), false);

  recordRateLimitAttempt(store, { ...options, now: 200 });
  assert.equal(isRateLimited(store, { ...options, now: 300 }), true);
});

test("consume does not record attempts after the limit is reached", () => {
  const store = new Map<string, number[]>();

  assert.equal(consumeRateLimitAttempt(store, { ...options, now: 100 }), true);
  assert.equal(consumeRateLimitAttempt(store, { ...options, now: 200 }), true);
  assert.equal(consumeRateLimitAttempt(store, { ...options, now: 300 }), false);
  assert.deepEqual(store.get(options.key), [100, 200]);
});

test("expired attempts and cleared keys no longer block clients", () => {
  const store = new Map<string, number[]>([
    ["client", [100, 200]],
    ["expired", [50]]
  ]);

  assert.equal(isRateLimited(store, { ...options, now: 1_201 }), false);
  pruneRateLimitStore(store, options.windowMs, 1_201);
  assert.equal(store.has("expired"), false);

  recordRateLimitAttempt(store, { ...options, now: 1_300 });
  clearRateLimit(store, options.key);
  assert.equal(store.has(options.key), false);
});
