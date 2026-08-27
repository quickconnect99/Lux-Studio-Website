"use client";

import {
  createContext,
  useContext,
  useState,
  useSyncExternalStore,
  type ReactNode
} from "react";
import { MOTION_STORAGE_KEY } from "@/lib/motion-preference";

interface MotionPreferenceContextValue {
  enabled: boolean;
  mounted: boolean;
  setEnabled: (value: boolean) => void;
}

const MotionPreferenceContext = createContext<MotionPreferenceContextValue>({
  enabled: true,
  mounted: false,
  setEnabled: () => {}
});

export function useMotionPreference() {
  return useContext(MotionPreferenceContext);
}

function resolveInitialPreference(): boolean {
  if (typeof window === "undefined") return true;

  try {
    const stored = localStorage.getItem(MOTION_STORAGE_KEY);
    if (stored === "true") return true;
    if (stored === "false") return false;
  } catch {
    // Storage may be unavailable (private browsing, disabled cookies); fall
    // through to the OS-level preference below.
  }

  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function MotionPreferenceProvider({
  children
}: {
  children: ReactNode;
}) {
  const [enabled, setEnabledState] = useState<boolean>(() =>
    resolveInitialPreference()
  );
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  function setEnabled(value: boolean) {
    setEnabledState(value);
    try {
      localStorage.setItem(MOTION_STORAGE_KEY, String(value));
    } catch {
      // The in-memory preference still applies for the current page.
    }
  }

  return (
    <MotionPreferenceContext.Provider value={{ enabled, mounted, setEnabled }}>
      {children}
    </MotionPreferenceContext.Provider>
  );
}
