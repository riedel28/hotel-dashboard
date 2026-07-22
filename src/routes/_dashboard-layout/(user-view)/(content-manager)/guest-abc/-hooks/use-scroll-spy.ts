import { type RefObject, useCallback, useLayoutEffect, useState } from 'react';

// Keep in sync with the `scroll-mt-24` (6rem = 96px) on each section so a
// letter highlights right as its section lands just below the sticky bar.
export const LETTER_SCROLL_OFFSET = 96;

type SectionRefs = RefObject<Record<string, HTMLDivElement | null>>;

/**
 * Highlights the section currently under the sticky bar and scrolls to a
 * section on demand, driven by a shared map of section elements. Keeping this
 * state here (rather than in the page) means scroll updates only re-render the
 * consumer, not the whole section/card tree.
 */
export function useScrollSpy(sectionRefs: SectionRefs) {
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  useLayoutEffect(() => {
    const sections = sectionRefs.current;
    const root = Object.values(sections).find(Boolean)?.closest('main');
    if (!root) return;

    const update = () => {
      const rootTop = root.getBoundingClientRect().top;
      const entries = Object.entries(sections);
      // Default to the first section so something is highlighted at the top.
      let active: string | null = entries[0]?.[0] ?? null;
      for (const [letter, el] of entries) {
        if (
          el &&
          el.getBoundingClientRect().top - rootTop <= LETTER_SCROLL_OFFSET
        ) {
          active = letter;
        }
      }
      setActiveLetter(active);
    };

    update();
    root.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      root.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [sectionRefs]);

  const scrollToLetter = useCallback(
    (letter: string) => {
      const el = sectionRefs.current[letter];
      const root = el?.closest('main');
      if (!el || !root) return;
      const top =
        root.scrollTop +
        el.getBoundingClientRect().top -
        root.getBoundingClientRect().top -
        LETTER_SCROLL_OFFSET;
      root.scrollTo({ top, behavior: 'smooth' });
      setActiveLetter(letter);
    },
    [sectionRefs]
  );

  return { activeLetter, scrollToLetter };
}
