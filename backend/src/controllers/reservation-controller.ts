import { and, desc, eq, gte, ilike, lte } from 'drizzle-orm';
import type { Request, Response } from 'express';

import { db } from '../db/pool';
import {
  guests as guestsTable,
  reservations as reservationsTable
} from '../db/schema';

async function getReservations(req: Request, res: Response) {
  try {
    const { page, per_page, status, q, from, to } = req.query;

    const conditions = [];

    if (status && status !== 'all') {
      conditions.push(
        eq(reservationsTable.state, status as 'pending' | 'started' | 'done')
      );
    }

    if (q) {
      // Only add condition if q is truthy
      conditions.push(ilike(reservationsTable.booking_nr, `%${q}%`));
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

    const reservations = await db.query.reservations.findMany({
      where: searchCondition,
      with: {
        guests: true
      },
      offset: ((Number(page) || 1) - 1) * (Number(per_page) || 10),
      limit: Number(per_page) || 10,
      orderBy: desc(reservationsTable.received_at)
    });

    // Get total count for pagination
    const totalCountResult = await db.query.reservations.findMany({
      where: searchCondition,
      columns: { id: true }
    });
    const totalCount = totalCountResult.length;

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
    res.status(500).json({ error: 'Failed to fetch reservation ' });
  }
}

async function createReservation(req: Request, res: Response) {
  const { booking_nr, room, page_url } = req.body;

  try {
    const [newReservation] = await db
      .insert(reservationsTable)
      .values({
        state: 'pending',
        booking_nr,
        guest_email: '',
        primary_guest_name: '',
        booking_id: '',
        room_name: room,
        booking_from: new Date(),
        booking_to: new Date(),
        check_in_via: 'web',
        check_out_via: 'web',
        last_opened_at: null,
        received_at: new Date(),
        completed_at: null,
        updated_at: null,
        page_url,
        balance: 0,
        adults: 1,
        youth: 0,
        children: 0,
        infants: 0,
        purpose: 'private',
        room
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
    res.status(500).json({ error: 'Failed to create reservation ' });
  }
}

async function updateReservation(req: Request, res: Response) {
  const { id } = req.params;
  const updates = req.body ?? {};
  const reservationId = Number(id);

  try {
    const reservationWithGuests = await db.transaction(async (tx) => {
      const { guests: guestPayload, ...reservationUpdates } = updates;

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
    res.status(500).json({ error: 'Failed to update reservation ' });
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
    res.status(500).json({ error: 'Failed to delete reservation ' });
  }
}

export {
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation
};
