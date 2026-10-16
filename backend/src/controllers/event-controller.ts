import {
  and,
  arrayOverlaps,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  lt,
  type SQL,
  sql
} from 'drizzle-orm';
import type { Response } from 'express';

import { sanitizeCmsHtml } from '../../../shared/cms-html';
import type {
  ParsedEventsParams,
  ParsedSaveEventData
} from '../../../shared/types/events';
import {
  assertImagesOwned,
  rethrowGoneImage,
  sweepImages
} from '../db/image-queries';
import { db } from '../db/pool';
import { eventImages, events, properties } from '../db/schema';
import { HttpProblem, withFailMessage } from '../middleware/error';
import {
  requireSelectedProperty,
  type SelectedPropertyRequest
} from '../middleware/selected-property';
import { escapeLikePattern } from '../utils/sql';

// Property scope is resolved by attachSelectedProperty. Without a selected
// property the list is empty and writes are 400. An event of another
// property is a 404.
const handle = withFailMessage<SelectedPropertyRequest>;

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

const eventNotFound = () => new HttpProblem(404, 'Event not found');

// The image ids of each event, in order
const imageIds = sql<string[]>`coalesce((
  select array_agg(${eventImages.image_id} order by ${eventImages.position})
  from ${eventImages}
  where ${eventImages.event_id} = ${events.id}
), '{}')`;

function selectEvents(where: SQL | undefined) {
  return db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      categories: events.categories,
      starts_at: events.starts_at,
      ends_at: events.ends_at,
      doors_open_at: events.doors_open_at,
      venue_name: events.venue_name,
      address_line_1: events.address_line_1,
      address_line_2: events.address_line_2,
      zip: events.zip,
      city: events.city,
      country_code: events.country_code,
      image_ids: imageIds,
      created_at: events.created_at,
      updated_at: events.updated_at
    })
    .from(events)
    .where(where);
}

type EventRow = Awaited<ReturnType<typeof selectEvents>>[number];

const transformEvent = (event: EventRow) => ({
  ...event,
  starts_at: event.starts_at.toISOString(),
  ends_at: event.ends_at.toISOString(),
  doors_open_at: event.doors_open_at?.toISOString() ?? null,
  created_at: event.created_at.toISOString(),
  updated_at: event.updated_at.toISOString()
});

const inProperty = (propertyId: string, eventId: number) =>
  and(eq(events.property_id, propertyId), eq(events.id, eventId));

async function sendEvent(
  res: Response,
  status: number,
  propertyId: string,
  eventId: number
) {
  const [event] = await selectEvents(inProperty(propertyId, eventId));
  if (!event) throw eventNotFound();
  res.status(status).json(transformEvent(event));
}

// Midnight starting a calendar day (YYYY-MM-DD) in the property's timezone
const startOfDay = (day: string, propertyId: string) =>
  sql`(${day}::date)::timestamp at time zone (
    select ${properties.timezone} from ${properties}
    where ${properties.id} = ${propertyId}
  )`;

const sortColumns = { starts_at: events.starts_at, title: events.title };

const getEvents = handle('Failed to fetch events', async (req, res) => {
  const {
    q,
    category,
    period,
    from,
    to,
    sort_by,
    sort_order,
    page,
    per_page: perPage
  }: ParsedEventsParams = res.locals.query;

  const propertyId = req.selectedPropertyId ?? null;
  if (!propertyId) {
    return res
      .status(200)
      .json({ index: [], page, per_page: perPage, total: 0, page_count: 0 });
  }

  const conditions: (SQL | undefined)[] = [eq(events.property_id, propertyId)];
  if (q) {
    conditions.push(ilike(events.title, `%${escapeLikePattern(q)}%`));
  }
  if (category?.length) {
    conditions.push(arrayOverlaps(events.categories, category));
  }
  if (period === 'upcoming') {
    conditions.push(gte(events.ends_at, sql`now()`));
  } else if (period === 'past') {
    conditions.push(lt(events.ends_at, sql`now()`));
  }
  // Events touching the days: ending on or after the first, starting before
  // the day after the last.
  if (from) {
    conditions.push(gte(events.ends_at, startOfDay(from, propertyId)));
  }
  if (to) {
    conditions.push(
      lt(
        events.starts_at,
        sql`${startOfDay(to, propertyId)} + interval '1 day'`
      )
    );
  }

  const where = and(...conditions);
  const direction = sort_order === 'desc' ? desc : asc;

  const [index, [{ total }]] = await Promise.all([
    selectEvents(where)
      .orderBy(
        direction(sortColumns[sort_by ?? 'starts_at']),
        asc(events.starts_at),
        asc(events.id)
      )
      .limit(perPage)
      .offset((page - 1) * perPage),
    db.select({ total: count() }).from(events).where(where)
  ]);

  res.status(200).json({
    index: index.map(transformEvent),
    page,
    per_page: perPage,
    total,
    page_count: Math.ceil(total / perPage)
  });
});

const getEventById = handle('Failed to fetch event', async (req, res) => {
  const propertyId = req.selectedPropertyId ?? null;
  if (!propertyId) throw eventNotFound();
  await sendEvent(res, 200, propertyId, Number(req.params.id));
});

function eventValues(data: ParsedSaveEventData) {
  const { image_ids: _imageIds, description, ...rest } = data;
  return {
    ...rest,
    description: description ? sanitizeCmsHtml(description) || null : null,
    starts_at: new Date(data.starts_at),
    ends_at: new Date(data.ends_at),
    doors_open_at: data.doors_open_at ? new Date(data.doors_open_at) : null
  };
}

// Replaces the event's images with `ids`, which must be the property's own.
async function setImages(
  tx: Tx,
  propertyId: string,
  eventId: number,
  ids: string[]
) {
  const unique = [...new Set(ids)];
  await assertImagesOwned(tx, propertyId, unique);

  await tx.delete(eventImages).where(eq(eventImages.event_id, eventId));
  if (unique.length > 0) {
    await tx.insert(eventImages).values(
      unique.map((image_id, position) => ({
        event_id: eventId,
        image_id,
        position
      }))
    );
  }
}

const createEvent = handle('Failed to create event', async (req, res) => {
  const propertyId = requireSelectedProperty(req, res);
  if (!propertyId) return;

  const data: ParsedSaveEventData = req.body;
  const id = await db
    .transaction(async (tx) => {
      const [created] = await tx
        .insert(events)
        .values({ property_id: propertyId, ...eventValues(data) })
        .returning({ id: events.id });
      await setImages(tx, propertyId, created!.id, data.image_ids);
      return created!.id;
    })
    .catch(rethrowGoneImage);

  await sendEvent(res, 201, propertyId, id);
});

const updateEvent = handle('Failed to update event', async (req, res) => {
  const propertyId = requireSelectedProperty(req, res);
  if (!propertyId) return;

  const id = Number(req.params.id);
  const data: ParsedSaveEventData = req.body;
  await db
    .transaction(async (tx) => {
      const [updated] = await tx
        .update(events)
        .set({ ...eventValues(data), updated_at: new Date() })
        .where(inProperty(propertyId, id))
        .returning({ id: events.id });
      if (!updated) throw eventNotFound();
      await setImages(tx, propertyId, id, data.image_ids);
    })
    .catch(rethrowGoneImage);

  await sweepImages(db, propertyId);
  await sendEvent(res, 200, propertyId, id);
});

const deleteEvent = handle('Failed to delete event', async (req, res) => {
  const propertyId = requireSelectedProperty(req, res);
  if (!propertyId) return;

  const [deleted] = await db
    .delete(events)
    .where(inProperty(propertyId, Number(req.params.id)))
    .returning({ id: events.id });
  if (!deleted) throw eventNotFound();

  await sweepImages(db, propertyId);
  res.status(200).json({ message: 'Event deleted successfully' });
});

export { createEvent, deleteEvent, getEventById, getEvents, updateEvent };
