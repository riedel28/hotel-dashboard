import { Trans, useLingui } from '@lingui/react/macro';
import * as React from 'react';

import { cn } from '@/lib/utils';

export interface TocSection {
  /** DOM id of the matching <section> in the form. */
  id: string;
  label: React.ReactNode;
}

/**
 * Single source of truth for the form's sections. The form renders one
 * `<section id={...} aria-labelledby={sectionHeadingId(id)}>` per entry and the
 * table of contents links to them by id.
 */
export const PAYMENT_FORM_SECTIONS: TocSection[] = [
  { id: 'credentials', label: <Trans>Credentials</Trans> },
  { id: 'recipient', label: <Trans>Payment recipient</Trans> },
  { id: 'mapping', label: <Trans>Mapping codes</Trans> }
];

/** Id of the heading that names a section, used for `aria-labelledby`. */
export function sectionHeadingId(sectionId: string) {
  return `${sectionId}-heading`;
}

/** The scroll container sections live in (see _dashboard-layout `<main>`). */
const SCROLL_ROOT_ID = 'main-content';

/**
 * Tracks which section is currently in view within the scroll container so the
 * table of contents can highlight it as the user scrolls.
 */
function useActiveSection(sections: TocSection[]) {
  const [activeId, setActiveId] = React.useState(sections[0]?.id ?? '');

  React.useEffect(() => {
    const root = document.getElementById(SCROLL_ROOT_ID);
    if (!root) return;

    // Distance below the container's top edge at which a section is considered
    // to have become the "current" one.
    const ACTIVATION_OFFSET = 120;
    let frame = 0;

    const compute = () => {
      frame = 0;
      const rootTop = root.getBoundingClientRect().top;

      // A short final section can't scroll to the activation line, so once the
      // container is scrolled to the bottom the last section is always current.
      const atBottom =
        root.scrollTop + root.clientHeight >= root.scrollHeight - 2;
      if (atBottom) {
        const last = sections.at(-1);
        if (last) setActiveId(last.id);
        return;
      }

      // Otherwise the current section is the last one whose top has crossed the
      // activation line.
      let current = sections[0]?.id ?? '';
      for (const { id } of sections) {
        const el = document.getElementById(id);
        if (
          el &&
          el.getBoundingClientRect().top - rootTop <= ACTIVATION_OFFSET
        ) {
          current = id;
        }
      }
      setActiveId(current);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(compute);
    };

    compute();
    root.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      root.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [sections]);

  return [activeId, setActiveId] as const;
}

export function PaymentProviderTableOfContents({
  sections,
  className
}: {
  sections: TocSection[];
  className?: string;
}) {
  const { t } = useLingui();
  const [activeId, setActiveId] = useActiveSection(sections);

  const handleClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveId(id);
  };

  return (
    <nav
      aria-label={t`On this page`}
      className={cn(
        'sticky top-2 order-2 h-fit w-[200px] self-start text-sm',
        className
      )}
    >
      <ul className="flex flex-col">
        {sections.map(({ id, label }) => {
          const isActive = id === activeId;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                aria-current={isActive ? 'location' : undefined}
                onClick={(event) => handleClick(event, id)}
                className={cn(
                  'block border-l px-3 py-1.25 font-normal text-muted-foreground transition-all hover:text-foreground',
                  isActive &&
                    'border-l-2 border-primary font-semibold text-foreground'
                )}
              >
                {label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
