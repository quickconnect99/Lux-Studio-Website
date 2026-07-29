import {
  adminFailure,
  adminSuccess,
  type AdminResult
} from "@/lib/admin-result";

type DatabaseMutationResult<T> = {
  data: T | null;
  error: unknown;
};

type ResolveAdminMutationOptions<TSource, TResult> = {
  operationFallback: string;
  staleMessage: string;
  mapData: (data: TSource) => TResult;
};

/**
 * Interprets a Supabase `maybeSingle()` mutation result.
 *
 * With an `updated_at` condition, `data: null` means the row changed after it
 * was loaded. That condition becomes a conflict result rather than a false
 * success, protecting edits made in another browser tab.
 */
export function resolveAdminMutationResult<TSource, TResult>(
  result: DatabaseMutationResult<TSource>,
  {
    operationFallback,
    staleMessage,
    mapData
  }: ResolveAdminMutationOptions<TSource, TResult>
): AdminResult<TResult> {
  if (result.error) {
    return adminFailure(result.error, operationFallback);
  }

  if (!result.data) {
    return adminFailure(
      {
        status: 409,
        code: "ADMIN_STALE",
        message: staleMessage
      },
      operationFallback
    );
  }

  return adminSuccess(mapData(result.data));
}
