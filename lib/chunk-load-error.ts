const CHUNK_LOAD_ERROR_PATTERNS = [
  /chunkloaderror/i,
  /loading chunk [\d-]+ failed/i,
  /failed to fetch dynamically imported module/i,
  /importing a module script failed/i
];

export function isChunkLoadError(error: unknown) {
  const errorText =
    error instanceof Error
      ? `${error.name} ${error.message}`
      : typeof error === "string"
        ? error
        : "";

  return CHUNK_LOAD_ERROR_PATTERNS.some((pattern) => pattern.test(errorText));
}
