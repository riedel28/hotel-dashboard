import type { RefObject } from 'react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import { useHorizontalOverflowMask } from '../-hooks/use-horizontal-overflow-mask';
import { useScrollSpy } from '../-hooks/use-scroll-spy';
import type { Entry } from './types';

interface LetterNavProps {
  containerRef: RefObject<HTMLDivElement | null>;
  entries: [string, Entry[]][];
  sectionRefs: RefObject<Record<string, HTMLDivElement | null>>;
  stuck: boolean;
  isLoading: boolean;
}

export function LetterNav({
  containerRef,
  entries,
  sectionRefs,
  isLoading,
  stuck
}: LetterNavProps) {
  const { viewportRef, maskImage } = useHorizontalOverflowMask();
  const { activeLetter, scrollToLetter } = useScrollSpy(sectionRefs);

  return (
    <div
      ref={containerRef}
      className={cn(
        'sticky -top-4 z-10 -mx-4 mb-6 border-b border-transparent bg-background px-4 pt-3 pb-3 transition-colors md:-mx-6 md:px-6',
        stuck && 'border-border'
      )}
    >
      <ScrollArea
        viewportRef={viewportRef}
        style={{ maskImage, WebkitMaskImage: maskImage }}
      >
        <div className="flex gap-3.5">
          {entries.map(([letter, items]) =>
            isLoading ? (
              <Skeleton className="size-12 shrink-0" />
            ) : (
              <Button
                key={letter}
                size="icon"
                variant="secondary"
                data-active={activeLetter === letter || undefined}
                disabled={items.length === 0}
                onClick={() => scrollToLetter(letter)}
                className={cn(
                  'relative size-12 shrink-0 cursor-pointer border border-border text-lg font-medium uppercase transition-colors duration-150 ease-out disabled:cursor-default motion-reduce:transition-none',
                  items.length === 0 && 'opacity-40'
                )}
              >
                {letter}
                <span className="absolute right-1 bottom-0.5 text-[9px] text-muted-foreground/90">
                  {items.length || null}
                </span>
              </Button>
            )
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
