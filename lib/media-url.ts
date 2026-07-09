const LOCAL_PATH_PATTERNS = [
  /^file:/i,
  /^\/Users\//i,
  /^\/home\//i,
  /^\/Volumes\//i,
  /^[a-z]:[\\/]/i,
  /^\\\\/
];

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

export function filterPublicMediaUrls(values: string[] | null | undefined) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((value) => normalizePublicMediaUrl(value))
    .filter(Boolean);
}
