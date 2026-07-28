import { useLingui } from '@lingui/react/macro';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { cn } from '@/lib/utils';

export interface NavSection {
  /** DOM id of the matching <section> on the page. */
  id: string;
  label: React.ReactNode;
  /** Draws a warning dot — used to surface a section that needs the user. */
  attention?: boolean;
}

/** Id of the heading that names a section, used for `aria-labelledby`. */
export function sectionHeadingId(sectionId: string) {
  return `${sectionId}-heading`;
}

/** The scroll container sections live in (see _dashboard-layout `<main>`). */
const SCROLL_ROOT_ID = 'main-content';

/**
 * Tracks which section is currently in view within the scroll container so the
 * navigation can highlight it as the user scrolls.
 */
export function useActiveSection(sections: NavSection[]) {
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

/**
 * Scrolls to a section and moves focus there, so the jump lands for keyboard
 * and screen-reader users too rather than only shifting pixels.
 */
export function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return false;

  const behavior: ScrollBehavior = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches
    ? 'auto'
    : 'smooth';

  // Drive the scroll container by hand rather than through `scrollIntoView`:
  // that walks *every* scrollable ancestor, and the layout shell's
  // `overflow-hidden` wrapper counts as one the moment anything gives it
  // scrollable overflow.
  const root = document.getElementById(SCROLL_ROOT_ID);
  if (root) {
    const offset =
      target.getBoundingClientRect().top - root.getBoundingClientRect().top;
    const scrollMargin =
      Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    root.scrollTo({ top: root.scrollTop + offset - scrollMargin, behavior });
  } else {
    target.scrollIntoView({ behavior, block: 'start' });
  }

  target.focus({ preventScroll: true });
  return true;
}

/** Classes that light a section's border once it has been jumped to. */
const HIGHLIGHT = ['ring-2', 'ring-primary/50', 'rounded-xl'];
const HIGHLIGHT_MS = 1200;

/**
 * Jumps to the section named in the URL hash on first load, then lights its
 * border briefly so the landing spot is obvious.
 *
 * A section rendered behind Suspense isn't in the DOM yet on a cold load — a
 * link pointing straight at one (`/profile#two-factor`, as the security emails
 * send) would find nothing — so the target is polled for a moment rather than
 * looked up once and given up on.
 */
export function useHashSectionJump() {
  React.useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;

    const RETRY_MS = 100;
    const MAX_ATTEMPTS = 20;
    let attempts = 0;
    let timer = 0;
    let clearHighlight = 0;

    const attempt = () => {
      attempts += 1;

      if (scrollToSection(id)) {
        const target = document.getElementById(id);
        target?.classList.add(...HIGHLIGHT);
        clearHighlight = window.setTimeout(
          () => target?.classList.remove(...HIGHLIGHT),
          HIGHLIGHT_MS
        );
        return;
      }

      if (attempts < MAX_ATTEMPTS) {
        timer = window.setTimeout(attempt, RETRY_MS);
      }
    };

    timer = window.setTimeout(attempt, RETRY_MS);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(clearHighlight);
    };
  }, []);
}

interface SectionNavProps {
  sections: NavSection[];
  className?: string;
  /**
   * `rail` is the sticky vertical list used on wide screens; `chips` is the
   * horizontally scrollable bar that replaces it when the column disappears.
   */
  orientation?: 'rail' | 'chips';
}

export function SectionNav({
  sections,
  className,
  orientation = 'rail'
}: SectionNavProps) {
  const { t } = useLingui();
  const [activeId, setActiveId] = useActiveSection(sections);
  const activeChipRef = React.useRef<HTMLAnchorElement>(null);
  const navigate = useNavigate();

  // Keep the current chip in view as the user scrolls the page, otherwise the
  // highlight drifts off the edge of the bar and reads as "nothing selected".
  React.useEffect(() => {
    if (orientation !== 'chips') return;
    activeChipRef.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
      inline: 'nearest',
      block: 'nearest'
    });
  }, [orientation]);

  const handleClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    if (!document.getElementById(id)) return;
    event.preventDefault();
    scrollToSection(id);
    // Through the router rather than `history.replaceState`: the router keeps
    // its own copy of the location and only watches `popstate`, so writing the
    // hash behind its back leaves `router.state.location` stale, and the next
    // navigation would rebuild the URL from that stale copy.
    // `search` is carried over explicitly: the router treats search params as
    // opt-in, so omitting it would strip them from any page that has them.
    void navigate({
      to: '.',
      hash: id,
      search: (prev: Record<string, unknown>) => prev,
      replace: true
    });
    setActiveId(id);
  };

  if (orientation === 'chips') {
    return (
      <nav
        aria-label={t`On this page`}
        className={cn(
          // The negative offsets cancel the scroll container's own top padding
          // (see _dashboard-layout `<main>`), which sticky would otherwise pin
          // below — leaving a strip of scrolling content between the bar and
          // the header.
          'bg-background sticky -top-2 z-10 -mx-6 px-6 py-2 border-b backdrop-blur-sm md:-top-4 ',
          className
        )}
      >
        <ul className="flex snap-x snap-mandatory gap-1.5 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
          {sections.map(({ id, label, attention }) => {
            const isActive = id === activeId;
            return (
              <li key={id} className="snap-start">
                <a
                  ref={isActive ? activeChipRef : undefined}
                  href={`#${id}`}
                  aria-current={isActive ? 'location' : undefined}
                  onClick={(event) => handleClick(event, id)}
                  className={cn(
                    // 44px tall: this bar is thumbed at arm's length on a tablet.
                    'flex h-11 items-center gap-1.5 rounded-lg font-semibold hover:bg-muted px-6 text-base whitespace-nowrap transition-colors',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current',
                    isActive
                      ? 'bg-muted font-semibold'
                      : 'text-muted-foreground hover:text-foreground border-transparent'
                  )}
                >
                  {label}
                  {attention && (
                    <span
                      aria-hidden="true"
                      className="bg-amber-500 size-1.5 shrink-0 rounded-full"
                    />
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <nav
      aria-label={t`On this page`}
      className={cn('sticky top-2 h-fit w-50 self-start text-sm', className)}
    >
      <ul className="flex flex-col">
        {sections.map(({ id, label, attention }) => {
          const isActive = id === activeId;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                aria-current={isActive ? 'location' : undefined}
                onClick={(event) => handleClick(event, id)}
                className={cn(
                  'text-muted-foreground hover:text-foreground flex items-center gap-2 border-s-2 border-transparent px-3 py-1.25 font-normal transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current',
                  isActive && 'border-primary text-foreground font-semibold'
                )}
              >
                <span className="min-w-0 flex-1 truncate">{label}</span>
                {attention && (
                  <span
                    aria-hidden="true"
                    className="bg-amber-500 size-1.5 shrink-0 rounded-full"
                  />
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
