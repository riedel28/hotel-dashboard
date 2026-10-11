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
  type CreateReservationData,
  type FetchReservationsParams,
  type GuestInput,
  toReservationStates,
  type UpdateReservationData
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

    // Every sortable column is named after its table column; the room sorts
    // by what the list shows for it: its number, failing that its name.
    const orderBy = (reservation: typeof reservationsTable) => {
      const column =
        sort_by === 'room_name'
          ? sql`coalesce(${roomNumberOf(reservation)}, ${reservation.room_name})`
          : reservation[sort_by];
      return sort_order === 'asc' ? asc(column) : desc(column);
    };

    const reservations = await db.query.reservations.findMany({
      where: searchCondition,
      ...reservationDetails,
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
      ...reservationDetails
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
  // Parsed by validateBody(createReservationSchema)
  const { guests, ...fields }: CreateReservationData = req.body;

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
        // The reservation and its guests land together or not at all
        newReservation = await db.transaction(async (tx) => {
          const [created] = await tx
            .insert(reservationsTable)
            .values({
              ...fields,
              state: 'pending',
              booking_nr,
              ...primaryGuestMirror(guests),
              booking_id: '',
              check_in_via: 'web',
              check_out_via: 'web',
              last_opened_at: null,
              received_at: new Date(),
              completed_at: null,
              updated_at: null,
              page_url: null,
              balance: '0',
              room: fields.room_name
            })
            .returning();

          if (created && guests.length > 0) {
            await tx
              .insert(guestsTable)
              .values(toGuestRows(guests, created.id));
          }

          return created;
        });
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
      ...reservationDetails
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

/**
 * The primary guest first, then the order guests were added in: the list and
 * the details drawer read the first guest as the primary one.
 */
const guestsInOrder = {
  orderBy: (guest: typeof guestsTable) => [
    desc(guest.is_primary),
    asc(guest.id)
  ]
};

/**
 * The number of the room a reservation names. A reservation knows its room by
 * name only, so this is a lookup rather than a join: a name shared by two
 * rooms must not double the reservation.
 */
const roomNumberOf = (reservation: typeof reservationsTable) =>
  // The rooms table is spelled out: inside a relational query drizzle
  // qualifies every interpolated column with the outer table's alias.
  sql<string | null>`(
    select room.room_number from rooms room
    where room.name = ${reservation.room_name}
    limit 1
  )`;

/** How every endpoint reads a reservation: with its guests and room number. */
const reservationDetails = {
  with: { guests: guestsInOrder },
  extras: (reservation: typeof reservationsTable) => ({
    room_number: roomNumberOf(reservation).as('room_number')
  })
};

/** What a reservation mirrors of its primary guest, for the list to read. */
function primaryGuestMirror(guests: GuestInput[]) {
  // The first guest, failing a flag: the same choice toGuestRows makes
  const primary = guests.find((guest) => guest.is_primary) ?? guests[0];
  return {
    guest_email: primary?.email || null,
    primary_guest_name: primary
      ? `${primary.first_name} ${primary.last_name}`
      : ''
  };
}

/**
 * Guest rows to insert for a reservation. One guest is the primary one: the
 * first flagged, or the first on the list when nobody is.
 */
function toGuestRows(guests: GuestInput[], reservationId: number) {
  const primaryIndex = Math.max(
    guests.findIndex((guest) => guest.is_primary),
    0
  );

  return guests.map((guest, index) => ({
    reservation_id: reservationId,
    first_name: guest.first_name,
    last_name: guest.last_name,
    email: guest.email || null,
    nationality_code: guest.nationality_code,
    age_group: guest.age_group,
    is_primary: index === primaryIndex
  }));
}

async function updateReservation(req: Request, res: Response) {
  const { id } = req.params;
  // Parsed by validateBody(updateReservationSchema)
  const body: UpdateReservationData = req.body ?? {};
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

      // The guest list is replaced wholesale
      const guestRows =
        guestPayload && toGuestRows(guestPayload, reservationId);

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
          ...(guestPayload && primaryGuestMirror(guestPayload)),
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

      if (guestRows) {
        await tx
          .delete(guestsTable)
          .where(eq(guestsTable.reservation_id, reservationId));

        if (guestRows.length > 0) {
          await tx.insert(guestsTable).values(guestRows);
        }
      }

      return tx.query.reservations.findFirst({
        where: eq(reservationsTable.id, reservationId),
        ...reservationDetails
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
      ...reservationDetails
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
