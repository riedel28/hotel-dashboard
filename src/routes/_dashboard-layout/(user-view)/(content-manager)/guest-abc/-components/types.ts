import { z } from 'zod';

export type Entry = { title: string; description: string };

export type GuestAbcData = Record<string, Entry[]>;

export const entrySchema = z.object({
  letter: z.string().min(1, 'Letter is required'),
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().min(1, 'Description is required')
});

export type EntryFormValues = z.infer<typeof entrySchema>;
