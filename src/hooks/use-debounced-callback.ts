import { useCallback, useEffect, useRef } from 'react';

export function useDebouncedCallback<T extends (...args: string[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  // A call still pending when the component unmounts must not fire: a search
  // box that navigates on change would pull the user back from the page they
  // have just moved on to.
  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
}
