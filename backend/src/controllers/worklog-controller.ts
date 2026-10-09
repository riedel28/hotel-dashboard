import { and, desc, eq, inArray } from 'drizzle-orm';
import type { Response } from 'express';

import type {
  Worklog,
  WorklogMessageData,
  WorklogUser
} from '../../../shared/types/worklogs';
import { db } from '../db/pool';
import {
  properties,
  type PropertyWorklog,
  propertyWorklogs,
  users
} from '../db/schema';
import type { AuthenticatedRequest } from '../middleware/auth';

// Shape DB records to match the API schema: dates as ISO strings, author and
// editor resolved to the bit of the user a card shows.
async function transformWorklogs(rows: PropertyWorklog[]): Promise<Worklog[]> {
  const userIds = [
    ...new Set(
      rows
        .flatMap((row) => [row.created_by, row.updated_by])
        .filter((id) => id !== null)
    )
  ];
  const people: WorklogUser[] =
    userIds.length === 0
      ? []
      : await db
          .select({
            id: users.id,
            first_name: users.first_name,
            last_name: users.last_name,
            email: users.email,
            avatar_url: users.avatar_url
          })
          .from(users)
          .where(inArray(users.id, userIds));
  const byId = new Map(people.map((person) => [person.id, person]));

  return rows.map((row) => ({
    id: row.id,
    property_id: row.property_id,
    message: row.message,
    created_at: row.created_at.toISOString(),
    created_by: byId.get(row.created_by ?? 0) ?? null,
    updated_at: row.updated_at?.toISOString() ?? null,
    updated_by: byId.get(row.updated_by ?? 0) ?? null
  }));
}

const matches = (propertyId: string, worklogId: number) =>
  and(
    eq(propertyWorklogs.id, worklogId),
    eq(propertyWorklogs.property_id, propertyId)
  );

async function getWorklogs(req: AuthenticatedRequest, res: Response) {
  try {
    const rows = await db
      .select()
      .from(propertyWorklogs)
      .where(eq(propertyWorklogs.property_id, String(req.params.id)))
      .orderBy(desc(propertyWorklogs.created_at), desc(propertyWorklogs.id));

    res.status(200).json(await transformWorklogs(rows));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch worklogs' });
  }
}

async function createWorklog(req: AuthenticatedRequest, res: Response) {
  try {
    const propertyId = String(req.params.id);
    const { message } = req.body as WorklogMessageData;

    const [property] = await db
      .select({ id: properties.id })
      .from(properties)
      .where(eq(properties.id, propertyId));
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const rows = await db
      .insert(propertyWorklogs)
      .values({
        property_id: propertyId,
        message,
        created_by: Number(req.user?.id)
      })
      .returning();

    const [worklog] = await transformWorklogs(rows);
    res.status(201).json(worklog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create worklog' });
  }
}

async function updateWorklog(req: AuthenticatedRequest, res: Response) {
  try {
    const where = matches(String(req.params.id), Number(req.params.worklogId));
    const { message } = req.body as WorklogMessageData;

    const [existing] = await db.select().from(propertyWorklogs).where(where);
    if (!existing) {
      return res.status(404).json({ error: 'Worklog not found' });
    }

    // Saving the same text is not an edit.
    const rows =
      existing.message === message
        ? [existing]
        : await db
            .update(propertyWorklogs)
            .set({
              message,
              updated_at: new Date(),
              updated_by: Number(req.user?.id)
            })
            .where(where)
            .returning();

    const [worklog] = await transformWorklogs(rows);
    if (!worklog) {
      return res.status(404).json({ error: 'Worklog not found' });
    }
    res.status(200).json(worklog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update worklog' });
  }
}

async function deleteWorklog(req: AuthenticatedRequest, res: Response) {
  try {
    const [deleted] = await db
      .delete(propertyWorklogs)
      .where(matches(String(req.params.id), Number(req.params.worklogId)))
      .returning({ id: propertyWorklogs.id });

    if (!deleted) {
      return res.status(404).json({ error: 'Worklog not found' });
    }

    res.status(200).json({ message: 'Worklog deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete worklog' });
  }
}

export { createWorklog, deleteWorklog, getWorklogs, updateWorklog };
