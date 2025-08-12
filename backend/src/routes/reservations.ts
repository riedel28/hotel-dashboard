import { Router } from 'express';

import { query } from '../db/pool';

type ReservationRow = {
  id: number;
  state: 'pending' | 'started' | 'done';
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
};

const router = Router();

router.post('/', async (req, res) => {
  const { booking_nr, room, page_url } = (req.body ?? {}) as {
    booking_nr?: unknown;
    room?: unknown;
    page_url?: unknown;
  };

  if (typeof booking_nr !== 'string' || booking_nr.trim() === '') {
    return res.status(400).json({
      error: { code: 'INVALID_PAYLOAD', message: 'booking_nr is required' }
    });
  }
  if (typeof room !== 'string' || room.trim() === '') {
    return res.status(400).json({
      error: { code: 'INVALID_PAYLOAD', message: 'room is required' }
    });
  }
  if (typeof page_url !== 'string' || page_url.trim() === '') {
    return res.status(400).json({
      error: { code: 'INVALID_PAYLOAD', message: 'page_url is required' }
    });
  }

  try {
    const insertSql = `
      INSERT INTO reservations (state, booking_nr, room_name, page_url, received_at)
      VALUES ('pending', $1, $2, $3, NOW())
      RETURNING id, state, booking_nr, guest_email, primary_guest_name, booking_id, room_name,
                booking_from, booking_to, check_in_via, check_out_via, last_opened_at,
                received_at, completed_at, page_url, balance, guests
    `;
    const result = await query<ReservationRow & { id: number }>(insertSql, [
      booking_nr,
      room,
      page_url
    ]);

    const created = result.rows[0];
    return res.status(201).json(created);
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
    const rowsResult = await query<ReservationRow>(rowsSql, [
      ...params,
      limit,
      offset
    ]);

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
        booking_nr,
        guests,
        -- Optional fields that may not exist in schema but are expected by the frontend
        NULL::int AS adults,
        NULL::int AS youth,
        NULL::int AS children,
        NULL::int AS infants,
        NULL::text AS purpose,
        NULL::text AS room,
        room_name
      FROM reservations
      WHERE id = $1
      LIMIT 1
    `;

    const result = await query<{
      booking_nr: string | null;
      guests: unknown | null;
      adults: number | null;
      youth: number | null;
      children: number | null;
      infants: number | null;
      purpose: string | null;
      room: string | null;
      room_name: string | null;
    }>(sql, [id]);

    const row = result.rows[0];

    if (!row) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Reservation not found' }
      });
    }

    const guests = Array.isArray(row.guests) ? (row.guests as unknown[]) : [];

    res.json({
      booking_nr: row.booking_nr ?? '',
      guests,
      adults: typeof row.adults === 'number' ? row.adults : 0,
      youth: typeof row.youth === 'number' ? row.youth : 0,
      children: typeof row.children === 'number' ? row.children : 0,
      infants: typeof row.infants === 'number' ? row.infants : 0,
      purpose: row.purpose === 'business' ? 'business' : 'private',
      room: row.room ?? row.room_name ?? ''
    });
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
  const { booking_nr, guests, room } = body ?? {};

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

  try {
    const sql = `
      UPDATE reservations
      SET
        booking_nr = COALESCE($2, booking_nr),
        guests = COALESCE($3::jsonb, guests),
        room_name = COALESCE($4, room_name)
      WHERE id = $1
      RETURNING id
    `;

    const params = [
      id,
      booking_nr ?? null,
      guests !== undefined ? JSON.stringify(guests) : null,
      room ?? null
    ];

    const result = await query<{ id: number }>(sql, params);
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Reservation not found' }
      });
    }

    // No response body needed by the frontend; 204 is sufficient
    return res.status(204).send();
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to update reservation',
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
