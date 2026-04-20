"use client";

import { useCallback, useState } from "react";

type FormShape = Record<string, unknown>;

export function useForm<T extends FormShape>(initialState: T) {
  const [values, setValues] = useState<T>(initialState);

  const updateField = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  }, []);

  const replace = useCallback((nextState: T) => {
    setValues(nextState);
  }, []);

  const reset = useCallback(() => {
    setValues(initialState);
  }, [initialState]);

  return {
    values,
    setValues,
    updateField,
    replace,
    reset
  };
}
