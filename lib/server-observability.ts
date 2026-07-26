import { randomUUID } from "node:crypto";

type LogValue = boolean | number | string | null | undefined;
type LogContext = Record<string, LogValue>;

type ServerEvent = {
  level: "error" | "info" | "warn";
  event: string;
  requestId: string;
  context?: LogContext;
  error?: unknown;
};

function getSafeErrorContext(error: unknown): LogContext {
  if (!error || typeof error !== "object") {
    return {
      errorType: typeof error
    };
  }

  const candidate = error as {
    name?: unknown;
    code?: unknown;
    status?: unknown;
  };

  return {
    errorType:
      typeof candidate.name === "string"
        ? candidate.name.slice(0, 80)
        : "UnknownError",
    errorCode:
      typeof candidate.code === "string"
        ? candidate.code.slice(0, 80)
        : undefined,
    errorStatus:
      typeof candidate.status === "number" ? candidate.status : undefined
  };
}

export function getRequestId(headers: Headers) {
  const incoming = headers.get("x-request-id")?.trim();

  if (incoming && /^[a-zA-Z0-9._-]{8,80}$/.test(incoming)) {
    return incoming;
  }

  return randomUUID();
}

export function logServerEvent({
  level,
  event,
  requestId,
  context,
  error
}: ServerEvent) {
  const payload = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    requestId,
    ...context,
    ...(error === undefined ? {} : getSafeErrorContext(error))
  });

  if (level === "error") {
    console.error(payload);
  } else if (level === "warn") {
    console.warn(payload);
  } else {
    console.info(payload);
  }
}
