import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  /** The stored preference ("light" | "dark" | "system") */
  theme: Theme;
  /** The actual applied theme after resolving "system" */
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  /** Toggles between light and dark (skips system) */
  toggleTheme: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "theme-preference";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme): void {
  const resolved = theme === "system" ? getSystemTheme() : theme;
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // localStorage may be unavailable (e.g. private browsing restrictions)
  }
  return "light";
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);
  const prevResolvedRef = useRef<"light" | "dark" | null>(null);

  // Apply theme class whenever preference changes. On an actual light↔dark
  // change (not the first mount), briefly flag <html> so the token-driven DOM
  // colours tween instead of snapping — see the `.theme-transition` rule in
  // index.css. The WebGL scene handles its own crossfade separately.
  useEffect(() => {
    const resolved = theme === "system" ? getSystemTheme() : theme;
    const prev = prevResolvedRef.current;
    if (prev !== null && prev !== resolved && typeof document !== "undefined") {
      const el = document.documentElement;
      el.classList.add("theme-transition");
      window.setTimeout(() => el.classList.remove("theme-transition"), 550);
    }
    prevResolvedRef.current = resolved;
    applyTheme(theme);
  }, [theme]);

  // Track system preference changes when theme is "system"
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  const resolvedTheme = theme === "system" ? getSystemTheme() : theme;

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
};
