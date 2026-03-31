import { useEffect, useRef } from "react";

/**
 * Executes a callback when a value changes.
 */
export function useOnChange<T>(value: T, callback: (value: T) => void) {
  const previousValue = useRef<T>(value);

  useEffect(() => {
    if (previousValue.current !== value) {
      callback(value);
      previousValue.current = value;
    }
  }, [value, callback]);
}
