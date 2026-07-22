import type { RefObject } from 'react';
import { EntryCard, EntryCardSkeleton } from './entry-card';
import type { Entry } from './types';

interface LetterSectionProps {
  letter: string;
  items: Entry[];
  isLoading: boolean;
  sectionRefs: RefObject<Record<string, HTMLDivElement | null>>;
}

export function LetterSection({
  letter,
  items,
  isLoading,
  sectionRefs
}: LetterSectionProps) {
  return (
    <div
      ref={(el) => {
        sectionRefs.current[letter] = el;
      }}
      className="scroll-mt-24 p-4 flex flex-col gap-4 max-w-lg"
    >
      <span className="text-2xl text-foreground/80 font-semibold uppercase">
        {letter}
      </span>

      {items.map((entry) =>
        isLoading ? (
          <EntryCardSkeleton key={entry.id} />
        ) : (
          <EntryCard key={entry.id} entry={entry} />
        )
      )}
    </div>
  );
}
