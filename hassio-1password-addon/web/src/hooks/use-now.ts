import { useCallback, useSyncExternalStore } from 'react';

/**
 * The current time, ticking every `intervalMs`. It is `null` on the server and
 * during hydration, so time-based text can't cause a hydration mismatch.
 */
export const useNow = (intervalMs: number = 1000): number | null => {
  const subscribe = useCallback(
    (onTick: () => void) => {
      const timer = setInterval(onTick, intervalMs);
      return () => clearInterval(timer);
    },
    [intervalMs]
  );

  return useSyncExternalStore(
    subscribe,
    // Rounded so the snapshot only changes once per interval
    () => Math.floor(Date.now() / intervalMs) * intervalMs,
    () => null
  );
};
