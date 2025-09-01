import { Router } from 'express';

import { createReservationSchema } from '../../../shared/types/reservations';
import { query } from '../db/pool';
import { validateBody } from '../middleware/validation';

const router = Router();

router.post('/', validateBody(createReservationSchema), async (req, res) => {
  const { booking_nr, room, page_url } = req.body;

  try {
    const insertSql = `
      INSERT INTO reservations (
        state,
        booking_nr,
        room_name,
        room,
        page_url,
        received_at,
        check_in_via,
        check_out_via,
        balance,
        guests,
        adults,
        youth,
        children,
        infants,
        purpose,
        guest_email,
        primary_guest_name,
        booking_id,
        booking_from,
        booking_to,
        last_opened_at,
        completed_at
      )
      VALUES (
        'pending',
        $1,
        $2,
        $2,
        $3,
        NOW(),
        'web',
        'web',
        0,
        '[]'::jsonb,
        1,
        0,
        0,
        0,
        'private',
        '',
        '',
        '',
        NOW(),
        NOW(),
        NULL,
        NULL
      )
      RETURNING id
    `;
    const insertResult = await query<{ id: number }>(insertSql, [
      booking_nr,
      room,
      page_url
    ]);

    const newId = insertResult.rows[0]?.id;
    if (!newId) {
      throw new Error('Failed to create reservation');
    }

    // Fetch the created reservation and shape it like GET /:id
    const selectSql = `
      SELECT
        id,
        state,
        booking_nr,
        guest_email,
        primary_guest_name,
        booking_id,
        room_name,
        booking_from,
        booking_to,
        check_in_via,
        check_out_via,
        last_opened_at,
        received_at,
        completed_at,
        page_url,
        balance,
        guests,
        adults,
        youth,
        children,
        infants,
        purpose,
        room
      FROM reservations
      WHERE id = $1
      LIMIT 1
    `;

    const selectResult = await query<{
      id: number;
      state: string;
      booking_nr: string | null;
      guest_email: string | null;
      primary_guest_name: string | null;
      booking_id: string | number | null;
      room_name: string | null;
      booking_from: string | null;
      booking_to: string | null;
      check_in_via: string | null;
      check_out_via: string | null;
      last_opened_at: string | null;
      received_at: string | null;
      completed_at: string | null;
      page_url: string | null;
      balance: number | null;
      guests: unknown[] | null;
      adults: number | null;
      youth: number | null;
      children: number | null;
      infants: number | null;
      purpose: string | null;
      room: string | null;
    }>(selectSql, [newId]);

    const row = selectResult.rows[0];
    const guestsArray = Array.isArray(row.guests)
      ? (row.guests as unknown[])
      : [];
    const responseBody = {
      id: row.id,
      state: row.state,
      booking_nr: row.booking_nr ?? '',
      guest_email: row.guest_email ?? '',
      guests: guestsArray,
      booking_id: String(row.booking_id ?? ''),
      room_name: row.room_name ?? '',
      booking_from:
        row.booking_from ?? row.received_at ?? new Date().toISOString(),
      booking_to: row.booking_to ?? row.received_at ?? new Date().toISOString(),
      check_in_via: (row.check_in_via ?? 'web') as string,
      check_out_via: (row.check_out_via ?? 'web') as string,
      primary_guest_name: row.primary_guest_name ?? '',
      last_opened_at: row.last_opened_at,
      received_at: row.received_at ?? new Date().toISOString(),
      completed_at: row.completed_at,
      page_url: row.page_url ?? 'https://example.com',
      balance: typeof row.balance === 'number' ? row.balance : 0,
      adults: row.adults ?? undefined,
      youth: row.youth ?? undefined,
      children: row.children ?? undefined,
      infants: row.infants ?? undefined,
      purpose: (row.purpose as 'private' | 'business' | null) ?? undefined,
      room: row.room ?? undefined
    };

    return res.status(201).json(responseBody);
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to create reservation',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined
      }
    });
  }
});

router.get('/', async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const requestedLimit = Number(req.query.per_page || 10);

  console.log(
    `Reservations request - page: ${page}, requested per_page: ${requestedLimit}`
  );

  // Only allow valid page sizes that match frontend options
  const validPageSizes = [5, 10, 25, 50, 100];

  // Strict validation - only allow valid page sizes
  let limit: number;
  if (!validPageSizes.includes(requestedLimit)) {
    console.log(
      `Invalid per_page requested: ${requestedLimit}, using default: 10`
    );
    limit = 10; // Default to 10 if invalid
  } else {
    limit = requestedLimit;
  }

  console.log(`Using limit: ${limit}`);

  const offset = (page - 1) * limit;
  const status = (req.query.status as string | undefined) || undefined;
  const q = (req.query.q as string | undefined) || undefined;

  // Validate query parameters
  if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
    return res.status(400).json({
      error: {
        code: 'INVALID_PARAMETERS',
        message: 'Invalid page or limit parameters'
      }
    });
  }

  if (status && !['pending', 'started', 'done', 'all'].includes(status)) {
    return res.status(400).json({
      error: {
        code: 'INVALID_STATUS',
        message: 'Invalid status parameter'
      }
    });
  }

  const where: string[] = [];
  const params: (string | number)[] = [];

  if (status && status !== 'all') {
    params.push(status);
    where.push(`state = $${params.length}`);
  }

  if (q) {
    params.push(`%${q}%`);
    const i = params.length;
    where.push(`booking_nr ILIKE $${i}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  try {
    const countSql = `SELECT COUNT(*)::int AS count FROM reservations ${whereSql}`;
    const countResult = await query<{ count: number }>(countSql, params);
    const total = countResult.rows[0]?.count ?? 0;

    const rowsSql = `
      SELECT id, state, booking_nr, guest_email, primary_guest_name, booking_id, room_name, booking_from, booking_to,
             check_in_via, check_out_via, last_opened_at, received_at, completed_at, page_url, balance, guests
      FROM reservations
      ${whereSql}
      ORDER BY id DESC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `;
    const rowsResult = await query<{
      id: number;
      state: string;
      booking_nr: string | null;
      guest_email: string | null;
      primary_guest_name: string | null;
      booking_id: string | number | null;
      room_name: string | null;
      booking_from: string | null;
      booking_to: string | null;
      check_in_via: string | null;
      check_out_via: string | null;
      last_opened_at: string | null;
      received_at: string | null;
      completed_at: string | null;
      page_url: string | null;
      balance: number | null;
      guests: unknown[] | null;
    }>(rowsSql, [...params, limit, offset]);

    res.json({
      index: rowsResult.rows,
      page,
      per_page: limit,
      total,
      pageCount: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to fetch reservations',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined
      }
    });
  }
});

router.get('/:id', async (req, res) => {
  const idParam = req.params.id;
  const id = Number(idParam);

  if (!Number.isFinite(id) || id < 1) {
    return res.status(400).json({
      error: {
        code: 'INVALID_ID',
        message: 'Reservation id must be a positive number'
      }
    });
  }

  try {
    const sql = `
      SELECT
        id,
        state,
        booking_nr,
        guest_email,
        primary_guest_name,
        booking_id,
        room_name,
        booking_from,
        booking_to,
        check_in_via,
        check_out_via,
        last_opened_at,
        received_at,
        completed_at,
        page_url,
        balance,
        guests,
        adults,
        youth,
        children,
        infants,
        purpose,
        room
      FROM reservations
      WHERE id = $1
      LIMIT 1
    `;

    const result = await query<{
      id: number;
      state: string;
      booking_nr: string | null;
      guest_email: string | null;
      primary_guest_name: string | null;
      booking_id: string | number | null;
      room_name: string | null;
      booking_from: string | null;
      booking_to: string | null;
      check_in_via: string | null;
      check_out_via: string | null;
      last_opened_at: string | null;
      received_at: string | null;
      completed_at: string | null;
      page_url: string | null;
      balance: number | null;
      guests: unknown[] | null;
      adults: number | null;
      youth: number | null;
      children: number | null;
      infants: number | null;
      purpose: string | null;
      room: string | null;
    }>(sql, [id]);

    const row = result.rows[0];

    if (!row) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Reservation not found' }
      });
    }

    const guests = Array.isArray(row.guests) ? (row.guests as unknown[]) : [];

    // Build response matching frontend zod schema
    const responseBody = {
      id: row.id,
      state: row.state,
      booking_nr: row.booking_nr ?? '',
      guest_email: row.guest_email ?? '',
      guests,
      booking_id: String(row.booking_id ?? ''),
      room_name: row.room_name ?? '',
      booking_from:
        row.booking_from ?? row.received_at ?? new Date().toISOString(),
      booking_to: row.booking_to ?? row.received_at ?? new Date().toISOString(),
      check_in_via: (row.check_in_via ?? 'web') as string,
      check_out_via: (row.check_out_via ?? 'web') as string,
      primary_guest_name: row.primary_guest_name ?? '',
      last_opened_at: row.last_opened_at,
      received_at: row.received_at ?? new Date().toISOString(),
      completed_at: row.completed_at,
      page_url: row.page_url ?? 'https://example.com',
      balance: typeof row.balance === 'number' ? row.balance : 0,
      adults: row.adults ?? undefined,
      youth: row.youth ?? undefined,
      children: row.children ?? undefined,
      infants: row.infants ?? undefined,
      purpose: (row.purpose as 'private' | 'business' | null) ?? undefined,
      room: row.room ?? undefined
    };

    res.json(responseBody);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to fetch reservation',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined
      }
    });
  }
});

type ReservationUpdatePayload = {
  booking_nr?: string;
  guests?: unknown;
  room?: string;
  adults?: number;
  youth?: number;
  children?: number;
  infants?: number;
  purpose?: 'private' | 'business';
};

router.patch('/:id', async (req, res) => {
  const idParam = req.params.id;
  const id = Number(idParam);

  if (!Number.isFinite(id) || id < 1) {
    return res.status(400).json({
      error: {
        code: 'INVALID_ID',
        message: 'Reservation id must be a positive number'
      }
    });
  }

  const body = req.body as ReservationUpdatePayload;
  const {
    booking_nr,
    guests,
    room,
    adults,
    youth,
    children,
    infants,
    purpose
  } = body ?? {};

  // Basic validation for provided fields only
  if (booking_nr !== undefined && typeof booking_nr !== 'string') {
    return res.status(400).json({
      error: { code: 'INVALID_PAYLOAD', message: 'booking_nr must be a string' }
    });
  }
  if (guests !== undefined && !Array.isArray(guests)) {
    return res.status(400).json({
      error: { code: 'INVALID_PAYLOAD', message: 'guests must be an array' }
    });
  }
  if (room !== undefined && typeof room !== 'string') {
    return res.status(400).json({
      error: { code: 'INVALID_PAYLOAD', message: 'room must be a string' }
    });
  }
  if (
    adults !== undefined &&
    (typeof adults !== 'number' || !Number.isInteger(adults) || adults < 1)
  ) {
    return res.status(400).json({
      error: {
        code: 'INVALID_PAYLOAD',
        message: 'adults must be an integer >= 1'
      }
    });
  }
  if (
    youth !== undefined &&
    (typeof youth !== 'number' || !Number.isInteger(youth) || youth < 0)
  ) {
    return res.status(400).json({
      error: {
        code: 'INVALID_PAYLOAD',
        message: 'youth must be an integer >= 0'
      }
    });
  }
  if (
    children !== undefined &&
    (typeof children !== 'number' ||
      !Number.isInteger(children) ||
      children < 0)
  ) {
    return res.status(400).json({
      error: {
        code: 'INVALID_PAYLOAD',
        message: 'children must be an integer >= 0'
      }
    });
  }
  if (
    infants !== undefined &&
    (typeof infants !== 'number' || !Number.isInteger(infants) || infants < 0)
  ) {
    return res.status(400).json({
      error: {
        code: 'INVALID_PAYLOAD',
        message: 'infants must be an integer >= 0'
      }
    });
  }
  if (
    purpose !== undefined &&
    purpose !== 'private' &&
    purpose !== 'business'
  ) {
    return res.status(400).json({
      error: {
        code: 'INVALID_PAYLOAD',
        message: "purpose must be 'private' or 'business'"
      }
    });
  }

  try {
    const updateSql = `
      UPDATE reservations
      SET
        booking_nr = COALESCE($2, booking_nr),
        guests = COALESCE($3::jsonb, guests),
        room = COALESCE($4, room),
        adults = COALESCE($5, adults),
        youth = COALESCE($6, youth),
        children = COALESCE($7, children),
        infants = COALESCE($8, infants),
        purpose = COALESCE($9, purpose)
      WHERE id = $1
      RETURNING id
    `;

    const updateParams = [
      id,
      booking_nr ?? null,
      guests !== undefined ? JSON.stringify(guests) : null,
      room ?? null,
      adults ?? null,
      youth ?? null,
      children ?? null,
      infants ?? null,
      purpose ?? null
    ];

    const result = await query<{ id: number }>(updateSql, updateParams);
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Reservation not found' }
      });
    }

    // Return the updated reservation (same shape as GET /:id)
    const selectSql = `
      SELECT
        id,
        state,
        booking_nr,
        guest_email,
        primary_guest_name,
        booking_id,
        room_name,
        booking_from,
        booking_to,
        check_in_via,
        check_out_via,
        last_opened_at,
        received_at,
        completed_at,
        page_url,
        balance,
        guests,
        adults,
        youth,
        children,
        infants,
        purpose,
        room
      FROM reservations
      WHERE id = $1
      LIMIT 1
    `;

    const selectResult = await query<{
      id: number;
      state: string;
      booking_nr: string | null;
      guest_email: string | null;
      primary_guest_name: string | null;
      booking_id: string | number | null;
      room_name: string | null;
      booking_from: string | null;
      booking_to: string | null;
      check_in_via: string | null;
      check_out_via: string | null;
      last_opened_at: string | null;
      received_at: string | null;
      completed_at: string | null;
      page_url: string | null;
      balance: number | null;
      guests: unknown[] | null;
      adults: number | null;
      youth: number | null;
      children: number | null;
      infants: number | null;
      purpose: string | null;
      room: string | null;
    }>(selectSql, [id]);

    const row = selectResult.rows[0];
    if (!row) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Reservation not found' }
      });
    }

    const guestsArray = Array.isArray(row.guests)
      ? (row.guests as unknown[])
      : [];
    const responseBody = {
      id: row.id,
      state: row.state,
      booking_nr: row.booking_nr ?? '',
      guest_email: row.guest_email ?? '',
      guests: guestsArray,
      booking_id: String(row.booking_id ?? ''),
      room_name: row.room_name ?? '',
      booking_from:
        row.booking_from ?? row.received_at ?? new Date().toISOString(),
      booking_to: row.booking_to ?? row.received_at ?? new Date().toISOString(),
      check_in_via: (row.check_in_via ?? 'web') as string,
      check_out_via: (row.check_out_via ?? 'web') as string,
      primary_guest_name: row.primary_guest_name ?? '',
      last_opened_at: row.last_opened_at,
      received_at: row.received_at ?? new Date().toISOString(),
      completed_at: row.completed_at,
      page_url: row.page_url ?? 'https://example.com',
      balance: typeof row.balance === 'number' ? row.balance : 0,
      adults: row.adults ?? undefined,
      youth: row.youth ?? undefined,
      children: row.children ?? undefined,
      infants: row.infants ?? undefined,
      purpose: (row.purpose as 'private' | 'business' | null) ?? undefined,
      room: row.room ?? undefined
    };

    return res.status(200).json(responseBody);
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to fetch reservation',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined
      }
    });
  }
});

router.delete('/:id', async (req, res) => {
  const idParam = req.params.id;
  const id = Number(idParam);

  if (!Number.isFinite(id) || id < 1) {
    return res.status(400).json({
      error: {
        code: 'INVALID_ID',
        message: 'Reservation id must be a positive number'
      }
    });
  }

  try {
    const result = await query<{ id: number }>(
      'DELETE FROM reservations WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Reservation not found' }
      });
    }

    return res.status(204).send();
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to delete reservation',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined
      }
    });
  }
});

export default router;
