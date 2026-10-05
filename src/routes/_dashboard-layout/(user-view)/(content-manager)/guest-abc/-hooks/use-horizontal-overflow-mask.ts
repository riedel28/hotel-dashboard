import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Fades the edge(s) of a horizontally scrollable element that still have
 * hidden content. Returns a ref for the scroll viewport and a `mask-image`
 * value to apply to it (undefined when nothing overflows).
 */
export function useHorizontalOverflowMask() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setEdges({
        left: scrollLeft > 1,
        right: scrollLeft + clientWidth < scrollWidth - 1
      });
    };

    update();
    el.addEventListener('scroll', update, { passive: true });
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener('scroll', update);
      resizeObserver.disconnect();
    };
  }, []);

  const maskImage =
    edges.left || edges.right
      ? `linear-gradient(to right, ${
          edges.left ? 'transparent, black 1.5rem' : 'black'
        }, ${edges.right ? 'black calc(100% - 1.5rem), transparent' : 'black'})`
      : undefined;

  return { viewportRef, maskImage };
}
