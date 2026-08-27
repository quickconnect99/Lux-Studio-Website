import "./dom-setup";
import assert from "node:assert/strict";
import test from "node:test";
import { act, renderHook } from "@testing-library/react";
import { useAdminUsers } from "../hooks/use-admin-users";

test("initial state has no accounts and is not loading", () => {
  const { result } = renderHook(() => useAdminUsers());

  assert.deepEqual(result.current.accounts, []);
  assert.equal(result.current.loading, false);
  assert.equal(result.current.error, null);
});

test("loadAccounts reports a missing session instead of throwing without a configured Supabase client", async () => {
  const { result } = renderHook(() => useAdminUsers());

  await act(async () => {
    await result.current.loadAccounts();
  });

  assert.equal(result.current.loading, false);
  assert.equal(result.current.error, "Missing admin session.");
  assert.deepEqual(result.current.accounts, []);
});

test("grantAccess reports a missing session and clears the mutating flag", async () => {
  const { result } = renderHook(() => useAdminUsers());

  const granted = await act(async () => result.current.grantAccess("user-1"));

  assert.equal(granted, false);
  assert.equal(result.current.error, "Missing admin session.");
  assert.equal(result.current.mutatingAccount, null);
});
