import type { z } from 'zod';

import type { createGuestAbcEntrySchema, GuestAbcEntry } from '@/api/guest-abc';

export type Entry = GuestAbcEntry;

// Form fields for the add-entry modal (title + description; letter is derived
// from the title on the server).
export type EntryFormValues = z.infer<typeof createGuestAbcEntrySchema>;

export const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

export type LetterGroup = [string, Entry[]];

// Group a flat entry list into ordered A–Z buckets. Every letter is present so
// the nav can render all 26 (empty ones disabled).
export function groupByLetter(entries: Entry[]): LetterGroup[] {
  const buckets = new Map<string, Entry[]>(
    ALPHABET.map((letter) => [letter, []])
  );
  for (const entry of entries) {
    buckets.get(entry.letter)?.push(entry);
  }
  return ALPHABET.map((letter) => [letter, buckets.get(letter) ?? []]);
}
