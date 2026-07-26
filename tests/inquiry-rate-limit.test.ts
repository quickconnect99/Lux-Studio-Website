import assert from "node:assert/strict";
import test from "node:test";
import {
  consumeInquiryRateLimit,
  hashRateLimitKey
} from "../lib/inquiry-rate-limit";

test("hashes client identifiers without retaining their raw value", () => {
  const raw = "192.0.2.1:example-browser";
  const hash = hashRateLimitKey(raw);

  assert.equal(hash.length, 64);
  assert.equal(hash.includes(raw), false);
  assert.equal(hash, hashRateLimitKey(raw));
});

test("uses the persistent decision when the RPC succeeds", async () => {
  const localStore = new Map<string, number[]>();
  const decision = await consumeInquiryRateLimit({
    key: "client",
    maxAttempts: 2,
    windowMs: 60_000,
    localStore,
    persistentConsume: async (parameters) => {
      assert.equal(parameters.p_client_key_hash.length, 64);
      assert.equal(parameters.p_max_attempts, 2);
      assert.equal(parameters.p_window_seconds, 60);
      return { data: false, error: null };
    }
  });

  assert.deepEqual(decision, {
    allowed: false,
    source: "persistent",
    fallbackReason: null
  });
  assert.equal(localStore.size, 0);
});

test("falls back to memory when the RPC is not deployed yet", async () => {
  const localStore = new Map<string, number[]>();
  const options = {
    key: "client",
    maxAttempts: 1,
    windowMs: 60_000,
    localStore,
    persistentConsume: async () => ({ data: null, error: { code: "42883" } }),
    now: 10_000
  };

  const first = await consumeInquiryRateLimit(options);
  const second = await consumeInquiryRateLimit(options);

  assert.equal(first.allowed, true);
  assert.equal(first.source, "memory");
  assert.equal(first.fallbackReason, "rpc-error");
  assert.equal(second.allowed, false);
});

test("treats a malformed RPC response as a safe local fallback", async () => {
  const decision = await consumeInquiryRateLimit({
    key: "client",
    maxAttempts: 3,
    windowMs: 1_500,
    localStore: new Map(),
    persistentConsume: async (parameters) => {
      assert.equal(parameters.p_window_seconds, 2);
      return { data: "yes", error: null };
    }
  });

  assert.equal(decision.allowed, true);
  assert.equal(decision.source, "memory");
  assert.equal(decision.fallbackReason, "invalid-response");
});
