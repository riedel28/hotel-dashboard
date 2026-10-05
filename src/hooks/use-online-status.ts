import * as React from 'react';

/**
 * Tracks connectivity so forms can hold unsaved edits instead of firing a
 * request that will fail. Matters on tablets carried around a hotel, where the
 * signal drops in basements and back corridors.
 *
 * `navigator.onLine` only knows whether the device has *a* network, not whether
 * the API is reachable, so treat this as a hint rather than proof.
 */
export function useOnlineStatus(): boolean {
  return React.useSyncExternalStore(
    (onChange) => {
      window.addEventListener('online', onChange);
      window.addEventListener('offline', onChange);
      return () => {
        window.removeEventListener('online', onChange);
        window.removeEventListener('offline', onChange);
      };
    },
    () => navigator.onLine,
    // Server/prerender fallback: assume connected rather than flashing a banner.
    () => true
  );
}
