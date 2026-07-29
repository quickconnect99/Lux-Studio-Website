import assert from "node:assert/strict";
import test from "node:test";
import { resolveAdminMutationResult } from "../lib/admin-optimistic-mutation";

test("maps successful optimistic mutation data", () => {
  const result = resolveAdminMutationResult(
    { data: { id: "record-id" }, error: null },
    {
      operationFallback: "Save failed.",
      staleMessage: "Record is stale.",
      mapData: (data) => data.id
    }
  );

  assert.deepEqual(result, { ok: true, data: "record-id" });
});

test("classifies empty optimistic mutation data as a conflict", () => {
  const result = resolveAdminMutationResult(
    { data: null, error: null },
    {
      operationFallback: "Save failed.",
      staleMessage: "Record is stale.",
      mapData: (data: { id: string }) => data.id
    }
  );

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.error.kind, "conflict");
    assert.equal(result.error.message, "Record is stale.");
  }
});
