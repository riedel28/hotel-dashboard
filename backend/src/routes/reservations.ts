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

export default router;
