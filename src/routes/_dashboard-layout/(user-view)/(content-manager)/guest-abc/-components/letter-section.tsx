import type { RefObject } from 'react';
import { EntryCard, EntryCardSkeleton } from './entry-card';
import type { Entry } from './types';

interface LetterSectionProps {
  letter: string;
  items: Entry[];
  isFetching: boolean;
  sectionRefs: RefObject<Record<string, HTMLDivElement | null>>;
  onUpdateEntry: (letter: string, index: number, entry: Entry) => void;
}

export function LetterSection({
  letter,
  items,
  isFetching,
  sectionRefs,
  onUpdateEntry
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

      {items.map((entry, index) =>
        isFetching ? (
          <EntryCardSkeleton key={index} />
        ) : (
          <EntryCard
            key={index}
            title={entry.title}
            description={entry.description}
            onUpdate={(updated) => onUpdateEntry(letter, index, updated)}
          />
        )
      )}
    </div>
  );
}
