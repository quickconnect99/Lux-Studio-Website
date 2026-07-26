import assert from "node:assert/strict";
import test from "node:test";
import { toAdminOperationError } from "../lib/admin-result";

test("maps authorization failures to a safe actionable message", () => {
  const result = toAdminOperationError(
    { code: "42501", message: "private policy detail" },
    "Fallback"
  );

  assert.equal(result.kind, "authorization");
  assert.equal(result.code, "42501");
  assert.match(result.message, /sign in again/i);
  assert.doesNotMatch(result.message, /private policy detail/i);
});

test("classifies conflicts without exposing raw database errors", () => {
  const result = toAdminOperationError(
    { code: "23505", message: "duplicate key value violates constraint foo" },
    "Fallback"
  );

  assert.equal(result.kind, "conflict");
  assert.match(result.message, /existing record/i);
  assert.doesNotMatch(result.message, /constraint foo/i);
});

test("uses the operation fallback for unknown errors", () => {
  const result = toAdminOperationError(
    new Error("sensitive implementation detail"),
    "The operation could not be completed."
  );

  assert.equal(result.kind, "unknown");
  assert.equal(result.message, "The operation could not be completed.");
});
