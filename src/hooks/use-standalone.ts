import * as React from 'react';

const query = '(display-mode: standalone)';

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(query);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

/**
 * Whether the app runs from the home screen rather than in a browser tab.
 * There the screen edge is free: a browser keeps it for its back gesture.
 */
export function useIsStandalone() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
}
