import { and, desc, eq, ilike } from 'drizzle-orm';
import type { Request, Response } from 'express';
import type { ReservationStatus } from 'shared/types/reservations';

import { db } from '../db/pool';
import { reservations as reservationsTable } from '../db/schema';

async function getReservations(req: Request, res: Response) {
  try {
    const { page, per_page, status, q } = req.query;

    const conditions = [];

    if (status && status !== 'all') {
      conditions.push(
        eq(reservationsTable.state, status as Exclude<ReservationStatus, 'all'>)
      );
    }

    if (q) {
      // Only add condition if q is truthy
      conditions.push(ilike(reservationsTable.booking_nr, `%${q}%`));
    }

    const searchCondition =
      conditions.length > 0 ? and(...conditions) : undefined;

    const reservations = await db.query.reservations.findMany({
      where: searchCondition,
      with: {
        guests: true
      },
      offset: Number(page),
      limit: Number(per_page),
      orderBy: desc(reservationsTable.received_at)
    });

    res.status(200).json({
      index: reservations,
      page: Number(page) || 1,
      per_page: Number(per_page) || 10,
      total: reservations.length,
      page_count: Math.ceil(reservations.length / Number(per_page)) || 0
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
      res.status(404).json({ error: 'Reservation not found' });
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

    const reservationWithGuests = await db.query.reservations.findFirst({
      where: eq(reservationsTable.id, newReservation.id),
      with: {
        guests: true
      }
    });

    res.status(201).json(reservationWithGuests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create reservation ' });
  }
}

async function updateReservation(req: Request, res: Response) {
  const { id } = req.params;
  const updates = req.body;

  try {
    const [updatedReservation] = await db
      .update(reservationsTable)
      .set({ ...updates, updated_at: new Date() })
      .where(eq(reservationsTable.id, Number(id)))
      .returning();

    if (!updatedReservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const reservationWithGuests = await db.query.reservations.findFirst({
      where: eq(reservationsTable.id, Number(id)),
      with: {
        guests: true
      }
    });

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
