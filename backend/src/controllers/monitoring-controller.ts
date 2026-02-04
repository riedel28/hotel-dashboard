import { and, asc, count, desc, eq, gte, ilike, lte, or } from 'drizzle-orm';
import type { Request, Response } from 'express';

import { db } from '../db/pool';
import { monitoringLogs as monitoringTable } from '../db/schema';

function escapeLikePattern(value: string): string {
  return value.replace(/[%_\\]/g, '\\$&');
}

async function getMonitoringLogs(req: Request, res: Response) {
  try {
    const { page, per_page, status, type, q, from, to, sort_by, sort_order } =
      req.query;

    const conditions = [];

    if (status) {
      conditions.push(
        eq(monitoringTable.status, status as 'success' | 'error')
      );
    }

    if (type) {
      conditions.push(
        eq(monitoringTable.type, type as 'pms' | 'door lock' | 'payment')
      );
    }

    if (q) {
      const escaped = escapeLikePattern(q as string);
      conditions.push(
        or(
          ilike(monitoringTable.booking_nr, `%${escaped}%`),
          ilike(monitoringTable.log_message, `%${escaped}%`),
          ilike(monitoringTable.event, `%${escaped}%`),
          ilike(monitoringTable.sub, `%${escaped}%`)
        )
      );
    }

    if (from) {
      const fromDate = new Date(from as string);
      conditions.push(gte(monitoringTable.logged_at, fromDate));
    }

    if (to) {
      const toDate = new Date(to as string);
      conditions.push(lte(monitoringTable.logged_at, toDate));
    }

    const searchCondition =
      conditions.length > 0 ? and(...conditions) : undefined;

    const sortColumn = (sort_by as string) || 'logged_at';
    const sortDirection = (sort_order as string) || 'desc';

    let orderByColumn;
    switch (sortColumn) {
      case 'status':
        orderByColumn = monitoringTable.status;
        break;
      case 'type':
        orderByColumn = monitoringTable.type;
        break;
      case 'booking_nr':
        orderByColumn = monitoringTable.booking_nr;
        break;
      case 'event':
        orderByColumn = monitoringTable.event;
        break;
      case 'logged_at':
      default:
        orderByColumn = monitoringTable.logged_at;
    }

    const orderBy =
      sortDirection === 'asc' ? asc(orderByColumn) : desc(orderByColumn);

    const limit = Number(per_page) || 10;
    const offset = ((Number(page) || 1) - 1) * limit;

    const logs = await db.query.monitoringLogs.findMany({
      where: searchCondition,
      offset,
      limit,
      orderBy
    });

    const totalCountResult = await db
      .select({ count: count() })
      .from(monitoringTable)
      .where(searchCondition);
    const totalCount = totalCountResult[0]?.count ?? 0;

    res.status(200).json({
      index: logs,
      page: Number(page) || 1,
      per_page: limit,
      total: totalCount,
      page_count: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch monitoring logs' });
  }
}

export { getMonitoringLogs };
