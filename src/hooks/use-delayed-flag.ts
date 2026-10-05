import { useEffect, useState } from 'react';

// True once `active` has stayed true for `delayMs`. For indicators that
// should not flash when the thing they announce is over almost at once.
export function useDelayedFlag(active: boolean, delayMs: number) {
  const [elapsed, setElapsed] = useState(false);

  useEffect(() => {
    if (!active) return;
    const timeout = setTimeout(() => setElapsed(true), delayMs);
    return () => {
      clearTimeout(timeout);
      setElapsed(false);
    };
  }, [active, delayMs]);

  return active && elapsed;
}
