export type RateLimitStore = Map<string, number[]>;

type RateLimitOptions = {
  key: string;
  maxAttempts: number;
  windowMs: number;
  now?: number;
};

export function getRecentAttempts(
  store: RateLimitStore,
  { key, windowMs, now = Date.now() }: RateLimitOptions
) {
  const recent = (store.get(key) ?? []).filter(
    (timestamp) => now - timestamp < windowMs
  );

  if (recent.length > 0) {
    store.set(key, recent);
  } else {
    store.delete(key);
  }

  return recent;
}

export function isRateLimited(
  store: RateLimitStore,
  options: RateLimitOptions
) {
  return getRecentAttempts(store, options).length >= options.maxAttempts;
}

export function recordRateLimitAttempt(
  store: RateLimitStore,
  options: RateLimitOptions
) {
  const now = options.now ?? Date.now();
  const recent = getRecentAttempts(store, { ...options, now });
  recent.push(now);
  store.set(options.key, recent);
}

export function consumeRateLimitAttempt(
  store: RateLimitStore,
  options: RateLimitOptions
) {
  if (isRateLimited(store, options)) {
    return false;
  }

  recordRateLimitAttempt(store, options);
  return true;
}

export function clearRateLimit(store: RateLimitStore, key: string) {
  store.delete(key);
}

export function pruneRateLimitStore(
  store: RateLimitStore,
  windowMs: number,
  now = Date.now()
) {
  for (const key of store.keys()) {
    getRecentAttempts(store, {
      key,
      maxAttempts: Number.POSITIVE_INFINITY,
      windowMs,
      now
    });
  }
}
