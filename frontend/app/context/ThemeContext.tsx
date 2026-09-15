"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useServerInsertedHTML } from "next/navigation";

export type Theme = "light" | "dark";

const STORAGE_KEY = "domner-theme";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredTheme(): Theme | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : null;
  } catch {
    return null;
  }
}

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Resolve the theme synchronously at first render: the anti-flash script in
 * the root layout has already tagged <html> with the class, so reading the
 * trusted sources here avoids a flash of the wrong palette.
 */
function resolveInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return readStoredTheme() ?? systemTheme();
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;

  // Keep browser chrome in sync even when the user override differs from the
  // OS scheme (the SSR meta tags ship one color per media query).
  const color = theme === "dark" ? "#0A0D12" : "#E2F1F1";
  document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
    meta.setAttribute("content", color);
  });
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(resolveInitialTheme);

  // Safely inject anti-flash script into SSR head without triggering React 19 client script warnings
  useServerInsertedHTML(() => {
    return (
      <script
        key="domner-theme-init"
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem('domner-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.classList.toggle('dark',t==='dark')}catch(e){}})();`,
        }}
      />
    );
  });

  // Keep the DOM synced whenever the theme changes (no setState here, so this
  // effect stays a pure external-system sync).
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Stay in tune with the OS when the user has not pinned a theme.
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (!readStoredTheme()) {
        setThemeState(media.matches ? "dark" : "light");
      }
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private mode — just apply for the session */
    }
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ theme, toggleTheme, setTheme }),
    [theme, toggleTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}