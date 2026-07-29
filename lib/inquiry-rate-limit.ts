import { createHash } from "node:crypto";
import { consumeRateLimitAttempt, type RateLimitStore } from "@/lib/rate-limit";

type PersistentRateLimitParameters = {
  p_client_key_hash: string;
  p_max_attempts: number;
  p_window_seconds: number;
};

type PersistentRateLimitResult = {
  data: unknown;
  error: unknown;
};

export type PersistentRateLimitConsume = (
  parameters: PersistentRateLimitParameters
) => PromiseLike<PersistentRateLimitResult>;

type ConsumeInquiryRateLimitOptions = {
  key: string;
  maxAttempts: number;
  windowMs: number;
  localStore: RateLimitStore;
  persistentConsume?: PersistentRateLimitConsume;
  now?: number;
};

export type InquiryRateLimitDecision = {
  allowed: boolean;
  source: "persistent" | "memory";
  fallbackReason: "unavailable" | "rpc-error" | "invalid-response" | null;
};

/** Hashes the client key before it crosses the persistent database boundary. */
export function hashRateLimitKey(key: string) {
  return createHash("sha256").update(key).digest("hex");
}

/**
 * Consumes one inquiry attempt using the persistent database limiter when
 * available, with an in-memory fallback for local development and outages.
 *
 * The decision exposes the source and fallback reason for observability without
 * exposing the original client key.
 */
export async function consumeInquiryRateLimit({
  key,
  maxAttempts,
  windowMs,
  localStore,
  persistentConsume,
  now
}: ConsumeInquiryRateLimitOptions): Promise<InquiryRateLimitDecision> {
  let fallbackReason: InquiryRateLimitDecision["fallbackReason"] =
    persistentConsume ? null : "unavailable";

  if (persistentConsume) {
    try {
      const { data, error } = await persistentConsume({
        p_client_key_hash: hashRateLimitKey(key),
        p_max_attempts: maxAttempts,
        p_window_seconds: Math.max(1, Math.ceil(windowMs / 1_000))
      });

      if (error) {
        fallbackReason = "rpc-error";
      } else if (typeof data === "boolean") {
        return {
          allowed: data,
          source: "persistent",
          fallbackReason: null
        };
      } else {
        fallbackReason = "invalid-response";
      }
    } catch {
      fallbackReason = "rpc-error";
    }
  }

  return {
    allowed: consumeRateLimitAttempt(localStore, {
      key,
      maxAttempts,
      windowMs,
      now
    }),
    source: "memory",
    fallbackReason
  };
}
