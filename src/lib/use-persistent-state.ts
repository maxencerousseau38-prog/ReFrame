"use client";

import * as React from "react";

/**
 * State mirrored to localStorage — the studio's layout memory (UX3).
 * SSR-safe: the initial render always uses `initial` (so server and first
 * client render match); the stored value is read in an effect right after
 * mount. Writes are debounced to the next tick via effect. Never throws.
 */
export function usePersistentState<T>(
  key: string,
  initial: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = React.useState<T>(initial);
  const hydrated = React.useRef(false);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw != null) setValue(JSON.parse(raw) as T);
    } catch {
      /* private mode / bad JSON — keep the initial value */
    }
    hydrated.current = true;
  }, [key]);

  React.useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full / blocked — non-fatal */
    }
  }, [key, value]);

  return [value, setValue];
}
