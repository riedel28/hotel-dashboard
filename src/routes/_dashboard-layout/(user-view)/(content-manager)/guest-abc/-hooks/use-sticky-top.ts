import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Tracks whether a `position: sticky` element is currently pinned to the top
 * of its scrolling `<main>` ancestor. Returns the ref to attach and the
 * `stuck` flag.
 */
export function useStickyTop<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);
  const [stuck, setStuck] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    const root = el?.closest('main');
    if (!el || !root) return;

    const update = () => {
      setStuck(
        el.getBoundingClientRect().top <= root.getBoundingClientRect().top + 1
      );
    };

    update();
    root.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      root.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return [ref, stuck] as const;
}
