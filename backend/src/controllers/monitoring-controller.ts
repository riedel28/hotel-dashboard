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
  lt,
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

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

async function getMonitoringLogs(req: Request, res: Response) {
  try {
    // validateQuery has already replaced req.query with the parsed schema output
    const {
      page,
      per_page,
      status,
      type,
      q,
      booking_nr,
      period,
      from,
      to,
      sort_by,
      sort_order
    } = req.query as FetchMonitoringLogsParams;

    // Every filter except status: the status counts are taken over these
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

    if (from || to) {
      if (from) {
        conditions.push(gte(monitoringTable.logged_at, new Date(from)));
      }
      if (to) {
        // A date-only `to` means "through the end of that day"
        conditions.push(
          DATE_ONLY.test(to)
            ? lt(
                monitoringTable.logged_at,
                new Date(new Date(to).getTime() + DAY_MS)
              )
            : lte(monitoringTable.logged_at, new Date(to))
        );
      }
    } else if (period) {
      conditions.push(
        gte(monitoringTable.logged_at, new Date(Date.now() - periodMs[period]))
      );
    }

    const sortColumns = {
      logged_at: monitoringTable.logged_at,
      status: monitoringTable.status,
      type: monitoringTable.type,
      booking_nr: monitoringTable.booking_nr,
      event: monitoringTable.event
    };
    const orderByColumn = sortColumns[sort_by ?? 'logged_at'];
    const orderBy =
      sort_order === 'asc' ? asc(orderByColumn) : desc(orderByColumn);

    const limit = per_page ?? 50;
    const currentPage = page ?? 1;

    const [logs, statusCounts] = await Promise.all([
      db
        .select({
          ...getTableColumns(monitoringTable),
          reservation_id: reservationsTable.id
        })
        .from(monitoringTable)
        .leftJoin(
          reservationsTable,
          eq(reservationsTable.booking_nr, monitoringTable.booking_nr)
        )
        .where(
          and(
            ...conditions,
            status ? eq(monitoringTable.status, status) : undefined
          )
        )
        .orderBy(orderBy, desc(monitoringTable.id))
        .limit(limit)
        .offset((currentPage - 1) * limit),
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
      page: currentPage,
      per_page: limit,
      total,
      counts,
      page_count: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch monitoring logs' });
  }
}

export { getMonitoringLogs };
