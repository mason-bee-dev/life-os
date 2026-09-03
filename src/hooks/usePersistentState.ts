import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

const PREFIX = "lifeos:";

/**
 * Drop-in replacement for useState that persists to localStorage under
 * "lifeos:<key>", so values survive a page reload. Falls back to plain
 * in-memory state if storage is unavailable (e.g. private browsing).
 */
export function usePersistentState<T>(
  key: string,
  defaultValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(PREFIX + key);
      return raw !== null ? (JSON.parse(raw) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      // ignore write failures (quota / disabled storage)
    }
  }, [key, value]);

  return [value, setValue];
}
