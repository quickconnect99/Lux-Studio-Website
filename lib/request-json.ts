export const DEFAULT_JSON_BODY_LIMIT_BYTES = 32 * 1024;

export class RequestBodyTooLargeError extends Error {
  constructor() {
    super("Request body exceeds the configured limit.");
    this.name = "RequestBodyTooLargeError";
  }
}

/**
 * Reads and parses a JSON request body without allowing unbounded buffering.
 *
 * Both a declared `content-length` and the bytes actually streamed are checked,
 * because clients can omit or falsify the header.
 *
 * @throws `RequestBodyTooLargeError` when the limit is exceeded.
 * @throws `SyntaxError` when the completed body is not valid JSON.
 */
export async function readLimitedJson(
  request: Request,
  limitBytes = DEFAULT_JSON_BODY_LIMIT_BYTES
) {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > limitBytes) {
    throw new RequestBodyTooLargeError();
  }

  if (!request.body) {
    return null;
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;

      if (totalBytes > limitBytes) {
        await reader.cancel();
        throw new RequestBodyTooLargeError();
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return JSON.parse(new TextDecoder().decode(body));
}
