import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  gte,
  ilike,
  inArray,
  lte,
  or
} from 'drizzle-orm';
import type { Request, Response } from 'express';

import type {
  FetchMonitoringLogsParams,
  MonitoringPeriod
} from '../../../shared/types/monitoring';
import { db } from '../db/pool';
import {
  monitoringLogs as monitoringTable,
  reservations as reservationsTable
} from '../db/schema';
import { escapeLikePattern } from '../utils/sql';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const periodMs: Record<MonitoringPeriod, number> = {
  '1h': HOUR_MS,
  '24h': DAY_MS,
  '7d': 7 * DAY_MS,
  '30d': 30 * DAY_MS
};

const sortColumns = {
  logged_at: monitoringTable.logged_at,
  status: monitoringTable.status,
  type: monitoringTable.type,
  booking_nr: monitoringTable.booking_nr,
  event: monitoringTable.event
} satisfies Record<FetchMonitoringLogsParams['sort_by'], unknown>;

// Logs with the id of the reservation carrying the same booking number
function selectLogs() {
  return db
    .select({
      ...getTableColumns(monitoringTable),
      reservation_id: reservationsTable.id
    })
    .from(monitoringTable)
    .leftJoin(
      reservationsTable,
      eq(reservationsTable.booking_nr, monitoringTable.booking_nr)
    );
}

/**
 * Every filter except status: the status counts are taken over these, and the
 * list adds the status on top.
 */
function buildConditions({
  type,
  booking_nr,
  q,
  period,
  from,
  to
}: FetchMonitoringLogsParams) {
  const conditions = [];

  if (type && type.length > 0) {
    conditions.push(inArray(monitoringTable.type, type));
  }

  if (booking_nr) {
    conditions.push(eq(monitoringTable.booking_nr, booking_nr));
  }

  if (q) {
    const escaped = escapeLikePattern(q);
    conditions.push(
      or(
        ilike(monitoringTable.booking_nr, `%${escaped}%`),
        ilike(monitoringTable.log_message, `%${escaped}%`),
        ilike(monitoringTable.event, `%${escaped}%`),
        ilike(monitoringTable.sub, `%${escaped}%`)
      )
    );
  }

  // An explicit range wins over a relative period
  if (from || to) {
    if (from) {
      conditions.push(gte(monitoringTable.logged_at, new Date(from)));
    }
    if (to) {
      conditions.push(lte(monitoringTable.logged_at, new Date(to)));
    }
  } else if (period) {
    conditions.push(
      gte(monitoringTable.logged_at, new Date(Date.now() - periodMs[period]))
    );
  }

  return conditions;
}

async function getMonitoringLogs(req: Request, res: Response) {
  try {
    // validateQuery has already replaced req.query with the parsed schema output
    const params = req.query as FetchMonitoringLogsParams;
    const { page, per_page, status, sort_by, sort_order } = params;

    const conditions = buildConditions(params);

    const orderByColumn = sortColumns[sort_by];
    const orderBy =
      sort_order === 'asc' ? asc(orderByColumn) : desc(orderByColumn);

    const [logs, statusCounts] = await Promise.all([
      selectLogs()
        .where(
          and(
            ...conditions,
            status ? eq(monitoringTable.status, status) : undefined
          )
        )
        .orderBy(orderBy, desc(monitoringTable.id))
        .limit(per_page)
        .offset((page - 1) * per_page),
      db
        .select({ status: monitoringTable.status, count: count() })
        .from(monitoringTable)
        .where(and(...conditions))
        .groupBy(monitoringTable.status)
    ]);

    const counts = { all: 0, success: 0, error: 0 };
    for (const row of statusCounts) {
      counts[row.status] = row.count;
      counts.all += row.count;
    }
    const total = status ? counts[status] : counts.all;

    res.status(200).json({
      index: logs,
      page,
      per_page,
      total,
      counts,
      page_count: Math.ceil(total / per_page)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch monitoring logs' });
  }
}

async function getMonitoringLogById(req: Request, res: Response) {
  try {
    const [log] = await selectLogs().where(
      eq(monitoringTable.id, Number(req.params.id))
    );

    if (!log) {
      return res.status(404).json({ error: 'Monitoring log not found' });
    }

    res.status(200).json(log);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch monitoring log' });
  }
}

export { getMonitoringLogById, getMonitoringLogs };
