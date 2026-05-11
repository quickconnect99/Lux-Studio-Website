"use client";

import {
  createContext,
  useContext,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { type ThemeId, DEFAULT_THEME, resolveTheme, isThemeId } from "@/lib/themes";

interface ThemeContextValue {
  theme: ThemeId;
  mounted: boolean;
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  mounted: false,
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    if (typeof document === "undefined") {
      return DEFAULT_THEME;
    }

    try {
      const stored = localStorage.getItem("theme");
      if (isThemeId(stored)) {
        document.documentElement.setAttribute("data-theme", stored);
        return stored;
      }
    } catch {}

    return resolveTheme(document.documentElement.getAttribute("data-theme"));
  });
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  function setTheme(id: ThemeId) {
    const nextTheme = resolveTheme(id);
    setThemeState(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    try {
      localStorage.setItem("theme", nextTheme);
    } catch {
      // ignore
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, mounted, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
