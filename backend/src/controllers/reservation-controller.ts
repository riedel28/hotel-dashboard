import { and, asc, count, desc, eq, gte, ilike, lte } from 'drizzle-orm';
import type { Request, Response } from 'express';

import { db } from '../db/pool';
import {
  guests as guestsTable,
  reservations as reservationsTable,
  rooms as roomsTable
} from '../db/schema';
import { escapeLikePattern } from '../utils/sql';

async function getReservations(req: Request, res: Response) {
  try {
    const { page, per_page, status, q, from, to, sort_by, sort_order } =
      req.query;

    const conditions = [];

    if (status && status !== 'all') {
      conditions.push(
        eq(reservationsTable.state, status as 'pending' | 'started' | 'done')
      );
    }

    if (q) {
      const escaped = escapeLikePattern(q as string);
      conditions.push(ilike(reservationsTable.booking_nr, `%${escaped}%`));
    }

    if (from) {
      const fromDate = new Date((from as string) + 'T00:00:00.000Z');
      conditions.push(gte(reservationsTable.booking_to, fromDate));
    }

    if (to) {
      const toDate = new Date((to as string) + 'T23:59:59.999Z');
      conditions.push(lte(reservationsTable.booking_from, toDate));
    }

    const searchCondition =
      conditions.length > 0 ? and(...conditions) : undefined;

    // Build dynamic orderBy clause
    const sortColumn = sort_by as
      | 'state'
      | 'booking_nr'
      | 'room_name'
      | 'booking_from'
      | 'booking_to'
      | 'balance'
      | 'received_at'
      | undefined;
    const sortDirection = sort_order as 'asc' | 'desc' | undefined;

    let orderByColumn;
    switch (sortColumn) {
      case 'state':
        orderByColumn = reservationsTable.state;
        break;
      case 'booking_nr':
        orderByColumn = reservationsTable.booking_nr;
        break;
      case 'room_name':
        orderByColumn = reservationsTable.room_name;
        break;
      case 'booking_from':
        orderByColumn = reservationsTable.booking_from;
        break;
      case 'booking_to':
        orderByColumn = reservationsTable.booking_to;
        break;
      case 'balance':
        orderByColumn = reservationsTable.balance;
        break;
      case 'received_at':
        orderByColumn = reservationsTable.received_at;
        break;
      default:
        orderByColumn = reservationsTable.received_at;
    }

    const orderBy =
      sortDirection === 'asc' ? asc(orderByColumn) : desc(orderByColumn);

    const reservations = await db.query.reservations.findMany({
      where: searchCondition,
      with: {
        guests: true
      },
      offset: ((Number(page) || 1) - 1) * (Number(per_page) || 10),
      limit: Number(per_page) || 10,
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
      page: Number(page) || 1,
      per_page: Number(per_page) || 10,
      total: totalCount,
      page_count: Math.ceil(totalCount / (Number(per_page) || 10))
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

async function createReservation(req: Request, res: Response) {
  const { room_name } = req.body;

  // Generate a unique booking number
  const booking_nr = `RES-${Date.now().toString(36).toUpperCase()}`;

  try {
    const [newReservation] = await db
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
              (guest.nationality_code as
                | 'DE'
                | 'US'
                | 'AT'
                | 'CH'
                | undefined) ?? 'DE';

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
          nationality_code: 'DE' | 'US' | 'AT' | 'CH';
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

export {
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation
};
