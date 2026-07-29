export type AdminOperationErrorKind =
  | "authorization"
  | "conflict"
  | "network"
  | "not-found"
  | "unknown";

export type AdminOperationError = {
  kind: AdminOperationErrorKind;
  message: string;
  code?: string;
};

export type AdminResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: AdminOperationError };

type ErrorLike = {
  code?: unknown;
  message?: unknown;
  status?: unknown;
};

function getErrorLike(error: unknown): ErrorLike {
  return typeof error === "object" && error !== null ? error : {};
}

/**
 * Converts unknown Supabase, PostgREST, and network failures into the small set
 * of error categories understood by the admin UI.
 *
 * Raw backend details are intentionally replaced with actionable user-facing
 * messages. The optional backend code is retained for diagnostics.
 */
export function toAdminOperationError(
  error: unknown,
  fallbackMessage: string
): AdminOperationError {
  const candidate = getErrorLike(error);
  const code = typeof candidate.code === "string" ? candidate.code : undefined;
  const status =
    typeof candidate.status === "number" ? candidate.status : undefined;
  const rawMessage =
    typeof candidate.message === "string" ? candidate.message : "";
  const normalizedMessage = rawMessage.toLowerCase();

  if (
    status === 401 ||
    status === 403 ||
    code === "42501" ||
    code === "PGRST301" ||
    normalizedMessage.includes("jwt")
  ) {
    return {
      kind: "authorization",
      code,
      message: "Your session is not authorized for this change. Sign in again."
    };
  }

  if (
    status === 409 ||
    code === "23505" ||
    normalizedMessage.includes("duplicate")
  ) {
    return {
      kind: "conflict",
      code,
      message:
        code === "ADMIN_STALE" && rawMessage
          ? rawMessage
          : "This change conflicts with an existing record."
    };
  }

  if (status === 404 || code === "PGRST116") {
    return {
      kind: "not-found",
      code,
      message: "The requested record no longer exists."
    };
  }

  if (
    normalizedMessage.includes("fetch") ||
    normalizedMessage.includes("network") ||
    normalizedMessage.includes("timeout")
  ) {
    return {
      kind: "network",
      code,
      message:
        "The server could not be reached. Check the connection and retry."
    };
  }

  return {
    kind: "unknown",
    code,
    message: fallbackMessage
  };
}

/** Wraps successful repository data in the `AdminResult` discriminated union. */
export function adminSuccess<T>(data: T): AdminResult<T> {
  return { ok: true, data };
}

/** Normalizes an unknown failure and wraps it as an unsuccessful result. */
export function adminFailure<T>(
  error: unknown,
  fallbackMessage: string
): AdminResult<T> {
  return {
    ok: false,
    error: toAdminOperationError(error, fallbackMessage)
  };
}
