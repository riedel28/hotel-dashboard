import { and, desc, eq, type SQL, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import type { NextFunction, Response } from 'express';

import type {
  Worklog,
  WorklogMessageData
} from '../../../shared/types/worklogs';
import { db } from '../db/pool';
import { properties, propertyWorklogs, users } from '../db/schema';
import type { AuthenticatedRequest } from '../middleware/auth';

const author = alias(users, 'author');
const editor = alias(users, 'editor');

// As much of a user as a card shows. Null when the join finds nobody: the
// user was deleted, or (for the editor) the entry was never edited.
const person = (user: typeof author) => ({
  id: user.id,
  first_name: user.first_name,
  last_name: user.last_name,
  email: user.email,
  avatar_url: user.avatar_url
});

// Entries in the API's shape, newest first.
async function findWorklogs(where: SQL | undefined): Promise<Worklog[]> {
  const rows = await db
    .select({
      worklog: propertyWorklogs,
      created_by: person(author),
      updated_by: person(editor)
    })
    .from(propertyWorklogs)
    .leftJoin(author, eq(author.id, propertyWorklogs.created_by))
    .leftJoin(editor, eq(editor.id, propertyWorklogs.updated_by))
    .where(where)
    .orderBy(desc(propertyWorklogs.created_at), desc(propertyWorklogs.id));

  return rows.map(({ worklog, created_by, updated_by }) => ({
    id: worklog.id,
    property_id: worklog.property_id,
    message: worklog.message,
    created_at: worklog.created_at.toISOString(),
    created_by,
    updated_at: worklog.updated_at?.toISOString() ?? null,
    updated_by
  }));
}

// The entry the URL names — only if it belongs to the property the URL names.
const entryOf = (req: AuthenticatedRequest) =>
  and(
    eq(propertyWorklogs.id, Number(req.params.worklogId)),
    eq(propertyWorklogs.property_id, String(req.params.id))
  );

/** 404s the collection routes when the property in the URL does not exist. */
async function requireProperty(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const [property] = await db
      .select({ id: properties.id })
      .from(properties)
      .where(eq(properties.id, String(req.params.id)));
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    next();
  } catch (error) {
    next(error);
  }
}

async function getWorklogs(req: AuthenticatedRequest, res: Response) {
  try {
    const worklogs = await findWorklogs(
      eq(propertyWorklogs.property_id, String(req.params.id))
    );
    res.status(200).json(worklogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch worklogs' });
  }
}

async function createWorklog(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const { message } = req.body as WorklogMessageData;

    const [created] = await db
      .insert(propertyWorklogs)
      .values({
        property_id: String(req.params.id),
        message,
        created_by: Number(req.user.id)
      })
      .returning({ id: propertyWorklogs.id });
    if (!created) {
      return res.status(500).json({ error: 'Failed to create worklog' });
    }

    const [worklog] = await findWorklogs(eq(propertyWorklogs.id, created.id));
    res.status(201).json(worklog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create worklog' });
  }
}

async function updateWorklog(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const { message } = req.body as WorklogMessageData;

    // One statement, so two admins saving at once cannot interleave. Saving
    // the same text matches no row and so is not recorded as an edit.
    await db
      .update(propertyWorklogs)
      .set({
        message,
        updated_at: new Date(),
        updated_by: Number(req.user.id)
      })
      .where(
        and(
          entryOf(req),
          sql`${propertyWorklogs.message} is distinct from ${message}`
        )
      );

    const [worklog] = await findWorklogs(entryOf(req));
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
      .where(entryOf(req))
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

export {
  createWorklog,
  deleteWorklog,
  getWorklogs,
  requireProperty,
  updateWorklog
};
