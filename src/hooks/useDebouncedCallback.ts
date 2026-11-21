import { useEffect, useRef } from 'react';

export interface DebouncedCallback<T> {
  schedule: (value: T) => void;
  cancel: () => void;
}

// Calls `callback` once `delayMs` passes without another schedule(). The pending call is
// dropped on unmount, so it never writes to a screen the user has left.
export const useDebouncedCallback = <T>(
  callback: (value: T) => void,
  delayMs: number,
): DebouncedCallback<T> => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const cancel = (): void => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const schedule = (value: T): void => {
    cancel();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      callbackRef.current(value);
    }, delayMs);
  };

  return { schedule, cancel };
};
