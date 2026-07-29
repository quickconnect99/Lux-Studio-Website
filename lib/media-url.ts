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
  const source = value?.trim();

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

/**
 * Returns a trimmed public media reference or the supplied fallback when the
 * value is blank or points to a local filesystem.
 */
export function normalizePublicMediaUrl(
  value: string | null | undefined,
  fallback = ""
) {
  const source = value?.trim();

  if (!source || isLocalFileReference(source)) {
    return fallback;
  }

  return source;
}

/** Normalizes a list and removes every blank or unsafe local media reference. */
export function filterPublicMediaUrls(values: string[] | null | undefined) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values.map((value) => normalizePublicMediaUrl(value)).filter(Boolean);
}
