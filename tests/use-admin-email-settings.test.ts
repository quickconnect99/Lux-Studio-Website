import "./dom-setup";
import assert from "node:assert/strict";
import test from "node:test";
import { act, renderHook } from "@testing-library/react";
import { useAdminEmailSettings } from "../hooks/use-admin-email-settings";

test("initial form state defaults to an unverified, empty SMTP configuration", () => {
  const { result } = renderHook(() => useAdminEmailSettings());

  assert.equal(result.current.formState.smtpHost, "");
  assert.equal(result.current.formState.smtpPort, "587");
  assert.equal(result.current.hasStoredPassword, false);
  assert.equal(result.current.isVerified, false);
});

test("updateField updates a single field and clears the status message", () => {
  const { result } = renderHook(() => useAdminEmailSettings());

  act(() => {
    result.current.updateField("smtpHost", "smtp.example.com");
  });

  assert.equal(result.current.formState.smtpHost, "smtp.example.com");
  assert.equal(result.current.statusMessage, null);
});

test("load reports a missing session instead of throwing without a configured Supabase client", async () => {
  const { result } = renderHook(() => useAdminEmailSettings());

  await act(async () => {
    await result.current.load();
  });

  assert.equal(result.current.loading, false);
  assert.equal(result.current.error, "Missing admin session.");
});

test("save reports a missing session and clears the saving flag", async () => {
  const { result } = renderHook(() => useAdminEmailSettings());

  const saved = await act(async () => result.current.save());

  assert.equal(saved, false);
  assert.equal(result.current.saving, false);
  assert.equal(result.current.error, "Missing admin session.");
});
