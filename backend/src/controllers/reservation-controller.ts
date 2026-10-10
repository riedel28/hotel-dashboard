import { randomBytes } from 'node:crypto';

import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  or,
  sql
} from 'drizzle-orm';
import type { Request, Response } from 'express';

import {
  type FetchReservationsParams,
  toReservationStates
} from '../../../shared/types/reservations';
import { db } from '../db/pool';
import {
  guests as guestsTable,
  reservations as reservationsTable,
  rooms as roomsTable
} from '../db/schema';
import { escapeLikePattern, isUniqueViolation } from '../utils/sql';

async function getReservations(req: Request, res: Response) {
  try {
    // validateQuery has already replaced req.query with the parsed schema output
    const {
      page = 1,
      per_page = 25,
      status,
      q,
      from,
      to,
      sort_by = 'received_at',
      sort_order
    } = req.query as FetchReservationsParams;

    const conditions = [];
    const states = toReservationStates(status);

    if (states.length > 0) {
      conditions.push(inArray(reservationsTable.state, states));
    }

    if (q) {
      const pattern = `%${escapeLikePattern(q)}%`;
      // A guest matches by either name or by a full name in both spellings
      const reservationsOfMatchingGuests = db
        .select({ id: guestsTable.reservation_id })
        .from(guestsTable)
        .where(
          or(
            ilike(guestsTable.first_name, pattern),
            ilike(guestsTable.last_name, pattern),
            ilike(
              sql`${guestsTable.first_name} || ' ' || ${guestsTable.last_name}`,
              pattern
            ),
            ilike(
              sql`${guestsTable.last_name} || ', ' || ${guestsTable.first_name}`,
              pattern
            )
          )
        );
      conditions.push(
        or(
          ilike(reservationsTable.booking_nr, pattern),
          inArray(reservationsTable.id, reservationsOfMatchingGuests)
        )
      );
    }

    if (from) {
      const fromDate = new Date(from + 'T00:00:00.000Z');
      conditions.push(gte(reservationsTable.booking_to, fromDate));
    }

    if (to) {
      const toDate = new Date(to + 'T23:59:59.999Z');
      conditions.push(lte(reservationsTable.booking_from, toDate));
    }

    const searchCondition =
      conditions.length > 0 ? and(...conditions) : undefined;

    // Every sortable column is named after its table column.
    const orderByColumn = reservationsTable[sort_by];
    const orderBy =
      sort_order === 'asc' ? asc(orderByColumn) : desc(orderByColumn);

    const reservations = await db.query.reservations.findMany({
      where: searchCondition,
      with: {
        guests: true
      },
      offset: (page - 1) * per_page,
      limit: per_page,
      orderBy
    });

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: count() })
      .from(reservationsTable)
      .where(searchCondition);
    const totalCount = totalCountResult[0]?.count ?? 0;

    res.status(200).json({
      index: reservations,
      page,
      per_page,
      total: totalCount,
      page_count: Math.ceil(totalCount / per_page)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
}

async function getReservationById(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const reservation = await db.query.reservations.findFirst({
      where: eq(reservationsTable.id, Number(id)),
      with: {
        guests: true
      }
    });

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    res.status(200).json(reservation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch reservation' });
  }
}

const MAX_BOOKING_NR_ATTEMPTS = 3;

async function createReservation(req: Request, res: Response) {
  const { room_name } = req.body;

  // booking_nr is unique in the database; two requests in the same
  // millisecond would collide, so a retry adds a random suffix.
  const baseBookingNr = `RES-${Date.now().toString(36).toUpperCase()}`;

  try {
    let newReservation: typeof reservationsTable.$inferSelect | undefined;

    for (let attempt = 1; !newReservation; attempt++) {
      const booking_nr =
        attempt === 1
          ? baseBookingNr
          : `${baseBookingNr}-${randomBytes(2).toString('hex').toUpperCase()}`;

      try {
        [newReservation] = await db
          .insert(reservationsTable)
          .values({
            state: 'pending',
            booking_nr,
            guest_email: null,
            primary_guest_name: '',
            booking_id: '',
            room_name,
            booking_from: new Date(),
            booking_to: new Date(),
            check_in_via: 'web',
            check_out_via: 'web',
            last_opened_at: null,
            received_at: new Date(),
            completed_at: null,
            updated_at: null,
            page_url: null,
            balance: '0',
            adults: 1,
            youth: 0,
            children: 0,
            infants: 0,
            purpose: 'private',
            room: room_name
          })
          .returning();
        break;
      } catch (error) {
        if (!isUniqueViolation(error) || attempt === MAX_BOOKING_NR_ATTEMPTS) {
          throw error;
        }
      }
    }

    if (!newReservation) {
      return res.status(500).json({ error: 'Failed to create reservation' });
    }

    const reservationWithGuests = await db.query.reservations.findFirst({
      where: eq(reservationsTable.id, newReservation.id),
      with: {
        guests: true
      }
    });

    if (!reservationWithGuests) {
      return res
        .status(500)
        .json({ error: 'Failed to fetch created reservation' });
    }

    res.status(201).json(reservationWithGuests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create reservation' });
  }
}

async function updateReservation(req: Request, res: Response) {
  const { id } = req.params;
  const body = req.body ?? {};
  const reservationId = Number(id);

  try {
    const reservationWithGuests = await db.transaction(async (tx) => {
      const {
        guests: guestPayload,
        state,
        booking_nr,
        guest_email,
        booking_id,
        room_name,
        booking_from,
        booking_to,
        check_in_via,
        check_out_via,
        primary_guest_name,
        last_opened_at,
        received_at,
        completed_at,
        page_url,
        balance,
        adults,
        youth,
        children,
        infants,
        purpose,
        room
      } = body;

      // If room ID was provided, look up the actual room name
      let resolvedRoomName = room_name;
      if (room !== undefined) {
        const roomId = Number(room);
        if (!Number.isNaN(roomId)) {
          const foundRoom = await tx.query.rooms.findFirst({
            where: eq(roomsTable.id, roomId)
          });
          if (foundRoom) {
            resolvedRoomName = foundRoom.name;
          }
        }
      }

      const reservationUpdates = Object.fromEntries(
        Object.entries({
          state,
          booking_nr,
          guest_email,
          booking_id,
          room_name: resolvedRoomName,
          booking_from,
          booking_to,
          check_in_via,
          check_out_via,
          primary_guest_name,
          last_opened_at,
          received_at,
          completed_at,
          page_url,
          balance,
          adults,
          youth,
          children,
          infants,
          purpose,
          room
        }).filter(([, v]) => v !== undefined)
      );

      const [updatedReservation] = await tx
        .update(reservationsTable)
        .set({ ...reservationUpdates, updated_at: new Date() })
        .where(eq(reservationsTable.id, reservationId))
        .returning();

      if (!updatedReservation) {
        return null;
      }

      if (Array.isArray(guestPayload)) {
        await tx
          .delete(guestsTable)
          .where(eq(guestsTable.reservation_id, reservationId));

        const sanitizedGuests = guestPayload
          .map((guest: Record<string, unknown>) => {
            const firstName =
              (guest.first_name as string | undefined) ??
              (guest.firstName as string | undefined);
            const lastName =
              (guest.last_name as string | undefined) ??
              (guest.lastName as string | undefined);

            if (!firstName || !lastName) {
              return null;
            }

            const nationality =
              (guest.nationality_code as string | undefined) ?? 'DE';

            return {
              reservation_id: reservationId,
              first_name: firstName,
              last_name: lastName,
              email: (guest.email as string | null | undefined) ?? null,
              nationality_code: nationality
            };
          })
          .filter(Boolean) as Array<{
          reservation_id: number;
          first_name: string;
          last_name: string;
          email: string | null;
          nationality_code: string;
        }>;

        if (sanitizedGuests.length > 0) {
          await tx.insert(guestsTable).values(sanitizedGuests);
        }
      }

      return tx.query.reservations.findFirst({
        where: eq(reservationsTable.id, reservationId),
        with: {
          guests: true
        }
      });
    });

    if (!reservationWithGuests) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    res.status(200).json(reservationWithGuests);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return res.status(409).json({ error: 'Booking number already exists' });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to update reservation' });
  }
}

async function deleteReservation(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const deletedReservations = await db.query.reservations.findFirst({
      where: eq(reservationsTable.id, Number(id)),
      with: {
        guests: true
      }
    });

    if (!deletedReservations) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    await db
      .delete(reservationsTable)
      .where(eq(reservationsTable.id, Number(id)));

    res.status(200).json(deletedReservations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete reservation' });
  }
}

async function searchGuests(req: Request, res: Response) {
  const { q } = req.query;

  try {
    const escaped = escapeLikePattern(q as string);
    const results = await db
      .selectDistinctOn(
        [
          guestsTable.first_name,
          guestsTable.last_name,
          guestsTable.email,
          guestsTable.nationality_code
        ],
        {
          first_name: guestsTable.first_name,
          last_name: guestsTable.last_name,
          email: guestsTable.email,
          nationality_code: guestsTable.nationality_code
        }
      )
      .from(guestsTable)
      .where(
        or(
          ilike(guestsTable.first_name, `%${escaped}%`),
          ilike(guestsTable.last_name, `%${escaped}%`)
        )
      )
      .limit(10);

    res.status(200).json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to search guests' });
  }
}

export {
  createReservation,
  deleteReservation,
  getReservationById,
  getReservations,
  searchGuests,
  updateReservation
};
