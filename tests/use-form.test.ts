import "./dom-setup";
import assert from "node:assert/strict";
import test from "node:test";
import { act, renderHook } from "@testing-library/react";
import { useForm } from "../hooks/use-form";

test("updateField preserves other fields", () => {
  const { result } = renderHook(() => useForm({ a: "1", b: "2" }));

  act(() => {
    result.current.updateField("a", "changed");
  });

  assert.deepEqual(result.current.values, { a: "changed", b: "2" });
});

test("replace swaps the complete form", () => {
  const { result } = renderHook(() => useForm({ a: "1", b: "2" }));

  act(() => {
    result.current.replace({ a: "x", b: "y" });
  });

  assert.deepEqual(result.current.values, { a: "x", b: "y" });
});

test("reset returns to the hook's initial state, not a later replace", () => {
  const { result } = renderHook(() => useForm({ a: "1", b: "2" }));

  act(() => {
    result.current.replace({ a: "x", b: "y" });
    result.current.reset();
  });

  assert.deepEqual(result.current.values, { a: "1", b: "2" });
});
