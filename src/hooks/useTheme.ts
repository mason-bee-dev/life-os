import { useCallback, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "lifeos:theme";

function readTheme(): Theme {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === "light" || raw === "dark") return raw;
  } catch {
    // ignore
  }
  try {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  } catch {
    return "dark";
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore write failures
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => readTheme());

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      applyTheme(next);
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
