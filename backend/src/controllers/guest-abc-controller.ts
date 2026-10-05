import { and, asc, eq } from 'drizzle-orm';
import type { Response } from 'express';

import {
  type CreateGuestAbcEntryData,
  deriveLetter,
  type UpdateGuestAbcEntryData
} from '../../../shared/types/guest-abc';
import { db } from '../db/pool';
import {
  guestAbcEntries,
  type GuestAbcEntry,
  type NewGuestAbcEntry
} from '../db/schema';
import type { SelectedPropertyRequest } from '../middleware/selected-property';

// Property scope is resolved by attachSelectedProperty. A missing property is
// handled per handler: GET → [], POST → 400, others → 404.
type GuestAbcRequest = SelectedPropertyRequest;

// Shape the DB record to match the API schema (dates as ISO strings).
function transformEntry(entry: GuestAbcEntry) {
  return {
    id: entry.id,
    property_id: entry.property_id,
    letter: entry.letter,
    title: entry.title,
    description: entry.description,
    created_at: entry.created_at.toISOString(),
    updated_at: entry.updated_at.toISOString()
  };
}

async function getGuestAbcEntries(req: GuestAbcRequest, res: Response) {
  try {
    const propertyId = req.selectedPropertyId ?? null;
    if (!propertyId) {
      // No property selected → nothing to show.
      return res.status(200).json([]);
    }

    const entries = await db
      .select()
      .from(guestAbcEntries)
      .where(eq(guestAbcEntries.property_id, propertyId))
      .orderBy(asc(guestAbcEntries.letter), asc(guestAbcEntries.title));

    res.status(200).json(entries.map(transformEntry));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch guest ABC entries' });
  }
}

async function createGuestAbcEntry(req: GuestAbcRequest, res: Response) {
  try {
    const propertyId = req.selectedPropertyId ?? null;
    if (!propertyId) {
      return res.status(400).json({ error: 'No property selected' });
    }

    // Body is validated + trimmed by validateBody(createGuestAbcEntrySchema).
    const { title, description } = req.body as CreateGuestAbcEntryData;

    const [entry] = await db
      .insert(guestAbcEntries)
      .values({
        property_id: propertyId,
        letter: deriveLetter(title),
        title,
        description
      })
      .returning();

    if (!entry) {
      return res
        .status(500)
        .json({ error: 'Failed to create guest ABC entry' });
    }

    res.status(201).json(transformEntry(entry));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create guest ABC entry' });
  }
}

async function updateGuestAbcEntry(req: GuestAbcRequest, res: Response) {
  try {
    const propertyId = req.selectedPropertyId ?? null;
    if (!propertyId) {
      return res.status(404).json({ error: 'Guest ABC entry not found' });
    }

    const id = Number(req.params.id);
    const { title, description } = (req.body ?? {}) as UpdateGuestAbcEntryData;

    const updates: Partial<
      Pick<NewGuestAbcEntry, 'title' | 'description' | 'letter'>
    > = {};
    if (title !== undefined) {
      updates.title = title;
      // Re-bucket when the title changes.
      updates.letter = deriveLetter(title);
    }
    if (description !== undefined) {
      updates.description = description;
    }

    const [entry] = await db
      .update(guestAbcEntries)
      .set({ ...updates, updated_at: new Date() })
      .where(
        and(
          eq(guestAbcEntries.id, id),
          eq(guestAbcEntries.property_id, propertyId)
        )
      )
      .returning();

    if (!entry) {
      return res.status(404).json({ error: 'Guest ABC entry not found' });
    }

    res.status(200).json(transformEntry(entry));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update guest ABC entry' });
  }
}

async function deleteGuestAbcEntry(req: GuestAbcRequest, res: Response) {
  try {
    const propertyId = req.selectedPropertyId ?? null;
    if (!propertyId) {
      return res.status(404).json({ error: 'Guest ABC entry not found' });
    }

    const id = Number(req.params.id);
    const [deleted] = await db
      .delete(guestAbcEntries)
      .where(
        and(
          eq(guestAbcEntries.id, id),
          eq(guestAbcEntries.property_id, propertyId)
        )
      )
      .returning();

    if (!deleted) {
      return res.status(404).json({ error: 'Guest ABC entry not found' });
    }

    res.status(200).json({ message: 'Guest ABC entry deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete guest ABC entry' });
  }
}

export {
  createGuestAbcEntry,
  deleteGuestAbcEntry,
  getGuestAbcEntries,
  updateGuestAbcEntry
};
