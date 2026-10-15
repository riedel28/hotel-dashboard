import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  gte,
  ilike,
  lte,
  or
} from 'drizzle-orm';
import type { SelectedFields } from 'drizzle-orm/pg-core';
import type { Request, Response } from 'express';

import type { FetchPaymentsParams } from '../../../shared/types/payments';
import { payments as paymentsTable } from '../db/payments-schema';
import { db } from '../db/pool';
import { reservations as reservationsTable } from '../db/schema';
import { escapeLikePattern } from '../utils/sql';

// The latest stage's date and amount are generated columns
const sortColumns = {
  updated_at: paymentsTable.last_stage_at,
  amount: paymentsTable.last_stage_amount
} satisfies Record<FetchPaymentsParams['sort_by'], unknown>;

// Payments joined to their reservation: the list, its count and a single
// payment all read from here
function fromPayments<TSelection extends SelectedFields>(
  selection: TSelection
) {
  return db
    .select(selection)
    .from(paymentsTable)
    .innerJoin(
      reservationsTable,
      eq(reservationsTable.id, paymentsTable.reservation_id)
    );
}

// The payment with its reservation's number and room
const paymentFields = {
  ...getTableColumns(paymentsTable),
  booking_nr: reservationsTable.booking_nr,
  room_name: reservationsTable.room_name
};

function buildConditions({ q, status, from, to }: FetchPaymentsParams) {
  const conditions = [];

  if (q) {
    const pattern = `%${escapeLikePattern(q)}%`;
    conditions.push(
      or(
        ilike(reservationsTable.booking_nr, pattern),
        ilike(paymentsTable.reference, pattern),
        // Card digits match only as a whole, never as part of a reference
        /^\d{4}$/.test(q) ? eq(paymentsTable.card_last4, q) : undefined
      )
    );
  }

  if (status) {
    conditions.push(eq(paymentsTable.stage, status));
  }

  if (from) {
    conditions.push(gte(paymentsTable.last_stage_at, new Date(from)));
  }
  if (to) {
    conditions.push(lte(paymentsTable.last_stage_at, new Date(to)));
  }

  return conditions;
}

async function getPayments(req: Request, res: Response) {
  try {
    // validateQuery has already replaced req.query with the parsed schema output
    const params = req.query as FetchPaymentsParams;
    const { page, per_page, sort_by, sort_order } = params;

    const where = and(...buildConditions(params));
    const orderByColumn = sortColumns[sort_by];
    const orderBy =
      sort_order === 'asc' ? asc(orderByColumn) : desc(orderByColumn);

    const [rows, [{ total }]] = await Promise.all([
      fromPayments(paymentFields)
        .where(where)
        .orderBy(orderBy, desc(paymentsTable.id))
        .limit(per_page)
        .offset((page - 1) * per_page),
      fromPayments({ total: count() }).where(where)
    ]);

    res.status(200).json({
      index: rows,
      page,
      per_page,
      total,
      page_count: Math.ceil(total / per_page)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
}

async function getPaymentById(req: Request, res: Response) {
  try {
    const [payment] = await fromPayments(paymentFields).where(
      eq(paymentsTable.id, Number(req.params.id))
    );

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
}

export { getPaymentById, getPayments };
