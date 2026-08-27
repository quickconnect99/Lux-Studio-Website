const LOCAL_PATH_PATTERNS = [
  /^file:/i,
  /^\/Users\//i,
  /^\/home\//i,
  /^\/Volumes\//i,
  /^[a-z]:[\\/]/i,
  /^\\\\/
];

/**
 * Detects machine-local paths that must never be emitted into public markup or
 * persisted as if they were web-accessible media.
 */
export function isLocalFileReference(value: string | null | undefined) {
  const source = typeof value === "string" ? value.trim() : "";

  if (!source) {
    return false;
  }

  try {
    const decoded = decodeURIComponent(source);
    return LOCAL_PATH_PATTERNS.some((pattern) => pattern.test(decoded));
  } catch {
    return LOCAL_PATH_PATTERNS.some((pattern) => pattern.test(source));
  }
}

function isSafeRepositoryPath(value: string) {
  if (!value.startsWith("/") || value.startsWith("//")) {
    return false;
  }

  // Browsers normalize backslashes in special URLs. Reject them (including
  // percent-encoded variants) so a value such as `/\\host/path` can never be
  // reinterpreted as a protocol-relative URL.
  try {
    return !/[\\\u0000-\u001f\u007f]/.test(decodeURIComponent(value));
  } catch {
    return false;
  }
}

/**
 * Distinguishes a genuinely remote media URL from a repository-bundled path.
 *
 * `next.config.mjs` only allows the Supabase storage origin as a remote image
 * pattern (and the CSP `img-src`/`media-src` mirror that), so any absolute
 * `http(s)` reference here is guaranteed to be that external source, never a
 * local asset shipped with the build.
 */
export function isRemoteMediaSource(value: string) {
  return /^https?:\/\//i.test(value.trim());
}

/**
 * Returns a trimmed public media reference or the supplied fallback when the
 * value is blank or points to a local filesystem.
 */
export function normalizePublicMediaUrl(value: unknown, fallback = "") {
  const source = typeof value === "string" ? value.trim() : "";

  if (!source || isLocalFileReference(source)) {
    return fallback;
  }

  if (isSafeRepositoryPath(source)) {
    return source;
  }

  try {
    const url = new URL(source);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : fallback;
  } catch {
    return fallback;
  }
}

/** Normalizes a list and removes every blank or unsafe local media reference. */
export function filterPublicMediaUrls(values: unknown) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values.map((value) => normalizePublicMediaUrl(value)).filter(Boolean);
}
